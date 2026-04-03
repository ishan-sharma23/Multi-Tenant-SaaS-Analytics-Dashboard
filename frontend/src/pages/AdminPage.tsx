import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAdminUser, fetchAdminUsers, updateUserRole } from "../api/admin";

export default function AdminPage(): JSX.Element {
  const queryClient = useQueryClient();
  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: "admin" | "user" }) =>
      updateUserRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => deleteAdminUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <section className="rounded-2xl border border-white/50 bg-white/85 p-5 shadow-panel">
      <h1 className="font-display text-2xl font-bold">Admin User Management</h1>
      <p className="mt-1 text-sm text-slate-600">Manage roles and deactivate users for your tenant.</p>

      <div className="mt-4 overflow-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-3">Name</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(usersQuery.data ?? []).map((user) => {
              const primaryRole = user.roles.includes("admin") ? "admin" : "user";

              return (
                <tr key={user.id} className="border-b border-slate-100">
                  <td className="py-3 font-semibold">{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.plan}</td>
                  <td>
                    <select
                      className="rounded-lg border border-slate-200 px-2 py-1"
                      value={primaryRole}
                      onChange={(event) =>
                        roleMutation.mutate({
                          userId: user.id,
                          role: event.target.value as "admin" | "user",
                        })
                      }
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        user.isActive ? "bg-ocean/10 text-ocean" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {user.isActive ? "active" : "inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(user.id)}
                      className="rounded-lg bg-berry px-3 py-1 font-semibold text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
