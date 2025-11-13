import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import axiosInstance from "@/utils/AxiosApi/AxiosInstance";
import { toast } from "sonner";

export default function ResetPassword() {
  const { token } = useSearch({ from: "/reset-password" });
  const navigate = useNavigate();

  const [tokenValid, setTokenValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (!token) {
      toast("Invalid link.");
      navigate({ to: "/signin" });
      return;
    }

    (async () => {
      try {
        const res = await axiosInstance.get(`/user/forgot-password/verify?token=${token}`);
        if (res.data.valid) setTokenValid(true);
        else {
          toast("Reset link expired or invalid.");
          navigate({ to: "/signin" });
        }
      } catch {
        toast("Invalid or expired reset link.");
        navigate({ to: "/signin" });
      }
    })();
  }, [token, navigate]);

  const handleReset = async () => {
    if (password !== confirm) return toast("Passwords do not match.");

    try {
      await axiosInstance.post("/user/forgot-password/reset-password", { token, password });
      toast("Password reset successfully!");
      navigate({ to: "/signin" });
    } catch (err) {
      console.error(err);
      toast("Failed to reset password.");
    }
  };

  if (!tokenValid) return <div className="text-center mt-20">Verifying link...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md w-96">
        <h2 className="text-xl font-semibold mb-4 text-center text-neutral-900 dark:text-neutral-50">Reset Password</h2>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 p-2 rounded mb-3 focus:ring-blue-500 focus:border-blue-500"
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 p-2 rounded mb-3 focus:ring-blue-500 focus:border-blue-500"
        />

        <button
          onClick={handleReset}
          className="w-full bg-neutral-600 text-white py-2 rounded hover:bg-neutral-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}
