import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "@tanstack/react-router";
import axiosInstance from "../../utils/AxiosApi/AxiosInstance";
import { toast } from "sonner";
import { decryptData, encryptData, removeEncryptedItem, setEncryptedItem } from "../../utils/Encryption/EncryptDecrypt";
import { useUserStore } from "@/Store/useUserStore";
import { Eye, EyeClosed } from "lucide-react";

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
  const [viewPassword, setViewPassword] = useState(false);

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
          toast(res.data.message);
          const getOtp = await axiosInstance.post("/user/localotp", values);
          toast(getOtp.data.message);
          console.log(getOtp);
          const otp = getOtp.data.otpDetails.otpCode;
          // console.log(otp);
          const otpEncrypted = await encryptData(otp);
          // console.log(otpEncrypted);

          const expiresAt = getOtp.data.otpDetails.expiresAt;
          // console.log(expiresAt);
          localStorage.setItem("otpData", JSON.stringify({ otp: otpEncrypted, expiresAt }));
          setOtpModalOpen(true);
          console.log(res.data.message);
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
        console.log(res);
        const user = res.data.user;
        const roles = res.data.roles;
        const permissions = res.data.permissions;

        const tokenRes = await axiosInstance.post("/user/token", {
          id: user.id,
          name: user.name,
          email: user.email,
          verified: user.verified,
        });

        const ipLog = await axiosInstance.post("/user/logip", { id: user.id });
        console.log(ipLog);

        const { accessToken, refreshToken } = tokenRes.data;

        await setEncryptedItem("accessToken", accessToken, remember);
        await setEncryptedItem("refreshToken", refreshToken, remember);
        await setEncryptedItem("userdata", user, remember);
        await setEncryptedItem("role", roles, remember);
        await setEncryptedItem("permission", permissions, remember);

        useUserStore.getState().setUser(user, roles, permissions, remember);

        await removeEncryptedItem("otpData");
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
    <section className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center py-8 px-4">
      <div className="flex flex-col items-center justify-center w-full">
        <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          <LogoIcon />
          ExpressWay
        </a>

        <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
          <div className="p-6 space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-neutral-900 dark:text-neutral-50 md:text-2xl">
              Sign in to your account
            </h1>

            <form className="space-y-4 md:space-y-6" onSubmit={formik.handleSubmit}>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-300">
                  Your email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  className={`bg-neutral-50 dark:bg-neutral-700 border ${
                    formik.touched.email && formik.errors.email ? "border-red-500" : "border-neutral-300"
                  } text-neutral-900 dark:text-neutral-50 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                  placeholder="name@company.com"
                />
                {formik.touched.email && formik.errors.email && <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-neutral-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={viewPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    className={`bg-neutral-50 dark:bg-neutral-700 border ${
                      formik.touched.password && formik.errors.password ? "border-red-500" : "border-neutral-300"
                    } text-neutral-900 dark:text-neutral-50 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                    placeholder={viewPassword ? "shh! dont see password" : "••••••••"}
                  />
                  {viewPassword ? (
                    <Eye
                      className={`${!otpModalOpen ? "absolute" : "hidden"} right-4 top-3.5 h-5 z-10 cursor-pointer text-muted-foreground`}
                      onMouseDown={() => setViewPassword(!viewPassword)}
                    />
                  ) : (
                    <EyeClosed
                      className={`${!otpModalOpen ? "absolute" : "hidden"} right-4 top-3.5 h-5 z-10 cursor-pointer text-muted-foreground`}
                      onClick={() => setViewPassword(!viewPassword)}
                    />
                  )}
                </div>
                {formik.touched.password && formik.errors.password && <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(!remember)}
                    className="w-4 h-4 border border-neutral-300 accent-accent-foreground dark:border-neutral-700 rounded bg-neutral-50 dark:bg-neutral-700  "
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-neutral-500 dark:text-neutral-300">
                    Remember me
                  </label>
                </div>

                <Link
                  to={"/forgot-password"}
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 transition duration-150"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full text-white bg-neutral-600 hover:bg-neutral-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition duration-150 disabled:opacity-60"
              >
                {formik.isSubmitting ? "Signing in..." : "Sign in"}
              </button>

              <p className="text-sm font-light text-neutral-500 text-center dark:text-neutral-400">
                Don't have an account yet?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate({ to: "/" });
                  }}
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Sign up
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>

      {otpModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 bg-opacity-50 dark:bg-opacity-70">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-50 mb-4 text-center">Enter OTP</h2>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              className="w-full border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 text-center text-lg dark:bg-neutral-700 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter 6-digit OTP"
            />
            <button
              onClick={handleVerifyOtp}
              className="mt-4 w-full bg-neutral-600 hover:bg-neutral-700 text-white font-medium py-2 rounded-lg transition duration-150"
            >
              Verify OTP
            </button>
            <button
              onClick={() => setOtpModalOpen(false)}
              className="mt-2 w-full border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition duration-150"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
