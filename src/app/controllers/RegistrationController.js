import * as Yup from 'yup';
import { startOfHour, isBefore, parseISO } from 'date-fns';

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

    const { student_id, start_date } = req.body;

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

    const registration = await Registration.create({
      student_id,
      start_date: dateStart,
    });

    return res.json(registration);
  }
}

export default new RegistrationController();
