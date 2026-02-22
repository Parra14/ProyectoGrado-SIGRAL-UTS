import Counter from '../models/Counter';

const generateCaseCode = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    { year: currentYear },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );

  const paddedSequence = counter.sequence.toString().padStart(5, '0');

  return `SIG-${currentYear}-${paddedSequence}`;
};

export default generateCaseCode;