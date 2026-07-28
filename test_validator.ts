import { registerSchema } from "./app/lib/validators";

const validData = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doeexample.com",
  password: "s123",
  phone: "1234567890"
};

const result = registerSchema.safeParse(validData);
if (!result.success) {
  console.error("Validation errors:", result.error.flatten());
} else {
  console.log("Validation passed:", result.data);
}





