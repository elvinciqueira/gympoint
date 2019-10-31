import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const { registration, student, title } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Bem vindo a Gympoint',
      template: 'registration',
      context: {
        studentName: student.name,
        dateStart: format(
          parseISO(registration.start_date),
          "dd 'de' MMMM', às' H:MM'h'",
          {
            locale: pt,
          }
        ),
        dateEnd: format(
          parseISO(registration.end_date),
          "dd 'de' MMMM', às' H:MM'h'",
          {
            locale: pt,
          }
        ),
        price: registration.price,
        plan: title,
      },
    });
  }
}

export default new RegistrationMail();
