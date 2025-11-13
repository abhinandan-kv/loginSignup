import { useFormik } from "formik";
import * as Yup from "yup";
import axiosInstance from "@/utils/AxiosApi/AxiosInstance";
import { toast } from "sonner";

export default function ForgotPassword() {
  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await axiosInstance.post("/user/forgot-password", { email: values.email });
        if (res.status === 200) toast("Reset link sent! Check your email.");
      } catch (err) {
        toast("Email not found or server error.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <form onSubmit={formik.handleSubmit} className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md w-96">
        <h2 className="text-xl font-semibold mb-4 text-center text-neutral-900 dark:text-neutral-50">Forgot Password</h2>
        <input
          name="email"
          type="email"
          placeholder="Your email"
          onChange={formik.handleChange}
          value={formik.values.email}
          className="w-full border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 p-2 rounded mb-3 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60"
        >
          {formik.isSubmitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
