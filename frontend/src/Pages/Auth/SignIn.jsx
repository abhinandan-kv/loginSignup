import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "@tanstack/react-router";
import axiosInstance from "../../utils/AxiosApi/AxiosInstance";
import { toast } from "sonner";
import { decryptData, encryptData, setEncryptedItem } from "../../utils/Encryption/EncryptDecrypt";
import { useUserStore } from "@/Store/useUserStore";

const LogoIcon = () => (
  <svg className="w-8 h-8 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export default function SignIn() {
  const navigate = useNavigate();
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(undefined);
  const [remember, setRemember] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Must be at least 6 characters").required("Password is required"),
  });

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setEmail(values.email);
        const res = await axiosInstance.post("/user/login", values);
        console.log("Login success: ", res.data);
        if (res.status === 200) {
          console.log(res.data.message);
          toast(res.data.message);
        }
        if (res.status === 201) {
          setOtpModalOpen(true);
          console.log(res.data.message);
          toast(res.data.message);
          const getOtp = await axiosInstance.post("/user/localotp", { email });
          toast(getOtp.data.message);
          console.log(getOtp);
          const otp = getOtp.data.otpDetails.otpCode;
          // console.log(otp);
          const otpEncrypted = await encryptData(otp);
          // console.log(otpEncrypted);

          const expiresAt = getOtp.data.otpDetails.expiresAt;
          // console.log(expiresAt);
          localStorage.setItem("otpData", JSON.stringify({ otp: otpEncrypted, expiresAt }));
        }
      } catch (err) {
        console.error(" Login failed:", err);
        toast("Invalid email or password");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // this method will send otp to the database <-NOT REQ. CURRENTLY
  // const handleVerifyOtp = async () => {
  //   try {
  //     const payload = {
  //       email: email,
  //       otp: otp,
  //       purpose: "login",
  //     };
  //     const res = await axiosInstance.post("/user/verifyotp", payload);
  //     console.log("OTP Verified:", res.data);
  //     setOtpModalOpen(false);

  //     if (res.status === 200) {
  //       toast("Login successful!");
  //       navigate({ to: "/dashboard", replace: true });

  //       const user = res.data.user;
  //       console.log(user);
  //       await setEncryptedItem("userdata", user);
  //     }
  //   } catch (err) {
  //     toast(" Invalid OTP, try again.");
  //     console.log(err);
  //   }
  // };

  // method to check otp through localstorage
  // const handleVerifyOtp = async () => {
  //   try {
  //     const storedOtp = JSON.parse(localStorage.getItem("otpData"));
  //     console.log(storedOtp);
  //     if (!storedOtp) {
  //       toast("Otp data not found, Re-send OTP!");
  //     }

  //     const storedEncryptedOtp = storedOtp.otp;
  //     const decryptStoredOtp = await decryptData(storedEncryptedOtp);
  //     // console.log(decryptStoredOtp);
  //     const expiresAt = storedOtp.expiresAt;
  //     const expiredBool = Date.now() < new Date(expiresAt).getTime();
  //     // console.log(new Date(expiresAt).getTime());
  //     // console.log(Date.now());
  //     // console.log(expiredBool);
  //     if (otp === decryptStoredOtp && expiredBool) {
  //       toast("Otp verified!");
  //       const res = await axiosInstance.post("/user/userdata", { email });
  //       // console.log(res);
  //       const user = res.data.user;
  //       // console.log(user);
  //       // get the token after successfull otp verification
  //       const tokenRes = await axiosInstance.post("/user/token", user);
  //       // console.log(tokenRes);

  //       const refreshToken = tokenRes.data.refreshToken;
  //       // after getting the refreshToken callrefreshToken for accessToken
  //       const accessTokenRes = await axiosInstance.post("/user/refresh", { refreshToken });
  //       // console.log(accessTokenRes);
  //       const accessToken = accessTokenRes.data.accessToken;

  //       await setEncryptedItem("accessToken", accessToken);
  //       await setEncryptedItem("refreshToken", refreshToken);

  //       // await setEncryptedItem("userdata", user)
  //       useUserStore.getState().setUser(user);
  //       navigate({ to: "/dashboard", replace: true });
  //     } else {
  //       toast("Wrong Or expired OTP");
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const handleVerifyOtp = async () => {
    try {
      const storedOtp = JSON.parse(localStorage.getItem("otpData"));
      if (!storedOtp) {
        toast("OTP data not found, please resend OTP!");
        return;
      }

      const storedEncryptedOtp = storedOtp.otp;
      const decryptStoredOtp = await decryptData(storedEncryptedOtp);
      const expiresAt = storedOtp.expiresAt;
      const notExpired = Date.now() < new Date(expiresAt).getTime();

      if (otp === decryptStoredOtp && notExpired) {
        toast("OTP verified!");

        const res = await axiosInstance.post("/user/userdata", { email });
        const user = res.data.user;

        const tokenRes = await axiosInstance.post("/user/token", {
          id: user.id,
          name: user.name,
          email: user.email,
          verified: user.verified,
        });

        const { accessToken, refreshToken } = tokenRes.data;

        if (remember) {
          await setEncryptedItem("accessToken", accessToken);
          await setEncryptedItem("refreshToken", refreshToken);
          await setEncryptedItem("userdata", user);
        } else {
          sessionStorage.setItem("accessToken", accessToken);
          sessionStorage.setItem("refreshToken", refreshToken);
          sessionStorage.setItem("userdata", JSON.stringify(user));
        }

        useUserStore.getState().setUser(user, remember);

        navigate({ to: "/dashboard", replace: true });
      } else {
        toast("Wrong or expired OTP");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      toast("Error verifying OTP");
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="flex flex-col items-center justify-center w-full">
        <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900">
          <LogoIcon />
          ExpressWay
        </a>

        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">Sign in to your account</h1>

            <form className="space-y-4 md:space-y-6" onSubmit={formik.handleSubmit}>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                  Your email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  className={`bg-gray-50 border ${
                    formik.touched.email && formik.errors.email ? "border-red-500" : "border-gray-300"
                  } text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                  placeholder="name@company.com"
                />
                {formik.touched.email && formik.errors.email && <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  className={`bg-gray-50 border ${
                    formik.touched.password && formik.errors.password ? "border-red-500" : "border-gray-300"
                  } text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                  placeholder="••••••••"
                />
                {formik.touched.password && formik.errors.password && <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.value)}
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-500">
                    Remember me
                  </label>
                </div>

                <Link to={"/forgot-password"} className="text-sm font-medium text-blue-600 hover:underline transition duration-150">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition duration-150 disabled:opacity-60"
              >
                {formik.isSubmitting ? "Signing in..." : "Sign in"}
              </button>

              <p className="text-sm font-light text-gray-500 text-center">
                Don't have an account yet?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate({ to: "/" });
                  }}
                  className="font-medium text-blue-600 hover:underline"
                >
                  Sign up
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>

      {otpModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Enter OTP</h2>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              className="w-full border border-gray-300 rounded-lg p-2 text-center text-lg  focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter 6-digit OTP"
            />
            <button
              onClick={handleVerifyOtp}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition duration-150"
            >
              Verify OTP
            </button>
            <button
              onClick={() => setOtpModalOpen(false)}
              className="mt-2 w-full border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-100 transition duration-150"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
