import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { register as registerUser } from "../api/auth";
import { useAuthStore } from "../store/auth.store";

const schema = z.object({
  tenantSlug: z.string().trim().min(2, "Tenant slug is required"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage(): JSX.Element {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
      navigate("/dashboard");
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="w-full max-w-lg rounded-3xl border border-white/50 bg-white/80 p-8 shadow-panel"
      >
        <h1 className="font-display text-3xl font-bold">Create Account</h1>
        <p className="mt-1 text-sm text-slate-600">Start tracking your tenant analytics in minutes.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-semibold">Tenant Slug</label>
            <input {...register("tenantSlug")} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
            {errors.tenantSlug && <p className="mt-1 text-xs text-berry">{errors.tenantSlug.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">First Name</label>
            <input {...register("firstName")} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
            {errors.firstName && <p className="mt-1 text-xs text-berry">{errors.firstName.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Last Name</label>
            <input {...register("lastName")} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
            {errors.lastName && <p className="mt-1 text-xs text-berry">{errors.lastName.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-semibold">Email</label>
            <input type="email" {...register("email")} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
            {errors.email && <p className="mt-1 text-xs text-berry">{errors.email.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-semibold">Password</label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
            {errors.password && <p className="mt-1 text-xs text-berry">{errors.password.message}</p>}
          </div>
        </div>

        {mutation.isError && (
          <p className="mt-3 rounded-xl bg-berry/10 px-3 py-2 text-sm text-berry">Registration failed.</p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-6 w-full rounded-xl bg-signal px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          {mutation.isPending ? "Creating account..." : "Create Account"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-ocean">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
