import Mail from '../../lib/Mail';

class HelpOrderMail {
  get Key() {
    return 'HelpOrderMail';
  }

  async handle({ data }) {
    const { order } = data;

    await Mail.sendMail({
      to: `${order.student.name} <${order.student.email}>`,
      subject: 'Resposta Gympoint',
      template: 'helporder',
      context: {
        studentName: order.student.name,
        question: order.question,
        answer: order.answer,
      },
    });
  }
}

export default new HelpOrderMail();
