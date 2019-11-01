import Queue from '../../lib/Queue';

import Student from '../models/Student';
import HelpOrder from '../models/HelpOrder';

import HelpOrderMail from '../jobs/HelpOrderMail';

class GymHelpOrderController {
  async index(req, res) {
    const questions = await HelpOrder.findAll({
      where: { answer: null },
      attributes: ['id', 'question', 'answer'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.json(questions);
  }

  async update(req, res) {
    const student_id = req.params.id;
    const { answer, id } = req.body;

    const student = await Student.findByPk(student_id);

    if (!student) return res.status(400).json({ error: 'Student not found' });

    const questionAvailable = await HelpOrder.findOne({
      where: {
        student_id,
        id,
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!questionAvailable) {
      return res.status(400).json({ error: 'No questions available.' });
    }

    const order = await questionAvailable.update({
      answer,
      answer_at: new Date(),
    });

    await order.save();

    await Queue.add(HelpOrderMail.key, {
      order,
    });

    return res.json(order);
  }
}

export default new GymHelpOrderController();
