import React, { useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import axiosInstance from "../../utils/AxiosApi/AxiosInstance";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeClosed } from "lucide-react";

const SignUp = () => {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState("");
  const [otp, setOtp] = useState(undefined);
  const [viewPassword, setViewPassword] = useState(false);
  const [viewPasswordConfirm, setViewPasswordConfirm] = useState(false);

  const navigate = useNavigate();

  async function handleClick() {
    const res = await axiosInstance.post("/user/verifyotp", { email: emailForOtp, otp });
    if (res.status === 200) {
      navigate({ to: "/signin" });
    }
  }

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email address").required("Email is required"),
      password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
      confirmPassword: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Confirm Password is required")
        .oneOf([Yup.ref("password"), null], "Passwords must match"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log("values- ", values);
        const res = await axiosInstance.post("/user/signup", values);
        console.log(res);
        if (res.status === 201) {
          toast(res.data.message);
          setEmailForOtp(values.email);
          setShowOtpModal(true);
        }
        if (res.status === 200) {
          console.log(res.data.message);
          toast(res.data.message);
        }
      } catch (error) {
        console.error("Signup failed:", error);
        toast("Signup failed. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <section className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center py-8 px-4">
      <div className="flex flex-col items-center justify-center w-full">
        <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          <LogoIcon />
          ExpressWay
        </a>

        <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
          <div className="p-6 space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-neutral-900 dark:text-neutral-50 md:text-2xl">
              Sign up to your account
            </h1>

            <form className="space-y-4 md:space-y-6" onSubmit={formik.handleSubmit}>
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className={`bg-neutral-50 dark:bg-neutral-700 border ${
                    formik.touched.name && formik.errors.name ? "border-red-500" : "border-neutral-300 dark:border-neutral-600"
                  } text-neutral-900 dark:text-neutral-50 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                  placeholder="yourgoodname"
                  {...formik.getFieldProps("name")}
                />
                {formik.touched.name && formik.errors.name ? <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p> : null}
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className={`bg-neutral-50 dark:bg-neutral-700 border ${
                    formik.touched.email && formik.errors.email ? "border-red-500" : "border-neutral-300 dark:border-neutral-600"
                  } text-neutral-900 dark:text-neutral-50 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                  placeholder="name@company.com"
                  {...formik.getFieldProps("email")}
                />
                {formik.touched.email && formik.errors.email ? <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p> : null}
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={viewPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    className={`bg-neutral-50 dark:bg-neutral-700 border ${
                      formik.touched.password && formik.errors.password ? "border-red-500" : "border-neutral-300 dark:border-neutral-600"
                    } text-neutral-900 dark:text-neutral-50 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    placeholder="••••••••"
                    {...formik.getFieldProps("password")}
                  />
                  {viewPassword ? (
                    <Eye
                      className={`${!showOtpModal ? "absolute" : "hidden"} right-4 top-3.5 h-5 z-10 cursor-pointer text-muted-foreground`}
                      onMouseDown={() => setViewPassword(!viewPassword)}
                    />
                  ) : (
                    <EyeClosed
                      className={`${!showOtpModal ? "absolute" : "hidden"} right-4 top-3.5 h-5 z-10 cursor-pointer text-muted-foreground`}
                      onClick={() => setViewPassword(!viewPassword)}
                    />
                  )}
                </div>
                {formik.touched.password && formik.errors.password ? <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p> : null}
              </div>

              <div>
                <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={viewPasswordConfirm ? "text" : "password"}
                    name="confirm-password"
                    id="confirm-password"
                    className={`bg-neutral-50 dark:bg-neutral-700 border ${
                      formik.touched.confirmPassword && formik.errors.confirmPassword
                        ? "border-red-500"
                        : "border-neutral-300 dark:border-neutral-600"
                    } text-neutral-900 dark:text-neutral-50 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    placeholder="••••••••"
                    {...formik.getFieldProps("confirmPassword")}
                  />
                  {viewPasswordConfirm ? (
                    <Eye
                      className={`${!showOtpModal ? "absolute" : "hidden"} right-4 top-3.5 h-5 z-10 cursor-pointer text-muted-foreground`}
                      onMouseDown={() => setViewPasswordConfirm(!viewPasswordConfirm)}
                    />
                  ) : (
                    <EyeClosed
                      className={`${!showOtpModal ? "absolute" : "hidden"} right-4 top-3.5 h-5 z-10 cursor-pointer text-muted-foreground`}
                      onClick={() => setViewPasswordConfirm(!viewPasswordConfirm)}
                    />
                  )}
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</p>
                ) : null}
              </div>

              <div className="flex items-center justify-end">
                <p className="text-sm font-light text-neutral-500 text-center dark:text-neutral-400">
                  Already A User?{" "}
                  <a
                    href="#"
                    className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 transition duration-150"
                    onClick={() => navigate({ to: "/signin" })}
                  >
                    Login
                  </a>{" "}
                </p>
              </div>

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full text-white bg-neutral-800 hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-900 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition duration-150"
              >
                {formik.isSubmitting ? "Signing up..." : "Sign up"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 bg-opacity-40 dark:bg-opacity-70 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 w-full max-w-sm text-center space-y-4">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">Enter OTP</h2>
            <p className="text-neutral-500 dark:text-neutral-300 text-sm">
              We've sent an OTP to <span className="font-medium">{emailForOtp}</span>
            </p>
            <input
              type="text"
              maxLength="6"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 text-center text-lg dark:bg-neutral-700 dark:text-neutral-50 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex justify-center space-x-3 mt-4">
              <button
                onClick={() => setShowOtpModal(false)}
                className="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClick}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 transition"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SignUp;

const LogoIcon = () => (
  <svg className="w-8 h-8 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
