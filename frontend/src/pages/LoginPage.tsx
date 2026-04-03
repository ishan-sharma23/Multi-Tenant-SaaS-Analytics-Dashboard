import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth";
import { useAuthStore } from "../store/auth.store";

const schema = z.object({
  tenantSlug: z.string().trim().min(2, "Tenant slug is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantSlug: "acme-growth",
      email: "admin@acme-growth.com",
      password: "password",
    },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
      navigate("/dashboard");
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="w-full max-w-md rounded-3xl border border-white/50 bg-white/80 p-8 shadow-panel"
      >
        <h1 className="font-display text-3xl font-bold">Welcome Back</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to your tenant dashboard.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">Tenant Slug</label>
            <input
              {...registerField("tenantSlug")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-signal/30 focus:ring"
            />
            {errors.tenantSlug && <p className="mt-1 text-xs text-berry">{errors.tenantSlug.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Email</label>
            <input
              {...registerField("email")}
              type="email"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-signal/30 focus:ring"
            />
            {errors.email && <p className="mt-1 text-xs text-berry">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Password</label>
            <input
              {...registerField("password")}
              type="password"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-signal/30 focus:ring"
            />
            {errors.password && <p className="mt-1 text-xs text-berry">{errors.password.message}</p>}
          </div>
        </div>

        {mutation.isError && (
          <p className="mt-3 rounded-xl bg-berry/10 px-3 py-2 text-sm text-berry">Login failed. Check credentials.</p>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-ink px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Signing in..." : "Sign In"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          New here?{" "}
          <Link to="/register" className="font-semibold text-ocean">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}
