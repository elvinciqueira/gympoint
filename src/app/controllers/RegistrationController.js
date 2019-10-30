import * as Yup from 'yup';
import { startOfHour, isBefore, parseISO, addMonths } from 'date-fns';

import Registration from '../models/Registration';
import Plan from '../models/Plan';
import Student from '../models/Student';

class RegistrationController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const registrations = await Registration.findAll({
      order: ['start_date'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
      ],
    });

    return res.json(registrations);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { student_id, start_date, plan_id } = req.body;

    /**
     * Check for admin
     */

    if (student_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'Only admins can make an registration.' });
    }

    /**
     * Check for past dates
     */
    const dateStart = startOfHour(parseISO(start_date));

    if (isBefore(dateStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted.' });
    }

    const { title, duration, price } = await Plan.findOne({
      where: { id: plan_id },
    });

    const student = await Student.findOne({
      where: { id: student_id },
    });

    const dateEnd = addMonths(dateStart, duration);

    const priceAll = price * duration;

    const finalPrice = priceAll.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });

    const registration = await Registration.create({
      student_id,
      start_date: dateStart,
      price: finalPrice,
      end_date: dateEnd,
      plan_id,
    });

    return res.json(registration);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number(),
      plan_id: Yup.number(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res.status(400).json({ error: "Enrollment doesn't exists. " });
    }

    const { id, plan_id, student_id, start_date } = await registration.update(
      req.body
    );

    return res.json({
      id,
      plan_id,
      start_date,
      student_id,
    });
  }

  async delete(req, res) {
    const registration = await Registration.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (registration.student_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this enrollment.",
      });
    }

    registration.destroy({
      where: { id: req.params.id },
    });

    return res.json(registration);
  }
}

export default new RegistrationController();
