import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useNavigate } from "react-router-dom";

const schema = yup.object({
  role: yup.string().required(),
  email: yup.string().email().required()
}).required();

export default function LoginForm(){
  const { register, handleSubmit, formState:{errors} } = useForm({resolver: yupResolver(schema), defaultValues:{role:"field", email:""}})
  const navigate = useNavigate();
  const onSubmit = data => {
    // Demo login: route based on role
    if(data.role === "admin") navigate("/admin");
    else navigate("/field-portal");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm">Role</label>
        <select {...register("role")} className="mt-1 w-full rounded border p-2">
          <option value="field">Field User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div>
        <label className="block text-sm">Email</label>
        <input {...register("email")} className="mt-1 w-full rounded border p-2" />
        <p className="text-xs text-red-600">{errors.email?.message}</p>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Login</button>
      </div>
    </form>
  )
}
