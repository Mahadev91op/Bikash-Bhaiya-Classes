export const validatePhone = (phone: string) => {
  return /^\+?[1-9]\d{9,14}$/.test(phone);
};

export const validateName = (name: string) => {
  return name.trim().length > 1;
};
