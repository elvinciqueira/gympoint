import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpOrderController {
  async index(req, res) {
    const { id } = req.params;

    const questions = await HelpOrder.findAll({
      where: { student_id: id },
      attributes: ['id', 'question', 'answer'],
    });

    return res.json(questions);
  }

  async store(req, res) {
    const { id } = req.params;
    const { question } = req.body;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const order = await HelpOrder.create({
      student_id: id,
      question,
    });

    return res.json(order);
  }
}

export default new HelpOrderController();
