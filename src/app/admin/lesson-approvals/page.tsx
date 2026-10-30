"use client";

import { useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { approveLessonRequest, getAdminLessonApprovals, rejectLessonRequest } from "@/services/scheduling.service";

const display=(value:string)=>new Date(value).toLocaleString(undefined,{weekday:"short",month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"});
export default function AdminLessonApprovalsPage(){
  const {role}=useAuth(); const queryClient=useQueryClient();
  const canManage=role==="admin"||role==="super_admin";
  const [notice,setNotice]=useState("");
  const approvalsQuery=useQuery({
    queryKey:["lesson-requests","pending-admin"],
    queryFn:getAdminLessonApprovals,
    enabled:canManage,
  });
  const decideMutation=useMutation({
    mutationFn:({id,approve}:{id:string;approve:boolean})=>approve?approveLessonRequest(id):rejectLessonRequest(id),
    onSuccess: async (_,{approve})=>{
      setNotice(approve?"Lesson approved and added to both calendars.":"Lesson rejected and the slot released.");
      await queryClient.invalidateQueries({queryKey:["lesson-requests"]});
      await queryClient.invalidateQueries({queryKey:["lessons"]});
      await queryClient.invalidateQueries({queryKey:["availability"]});
    },
  });
  const items=approvalsQuery.data ?? [];
  const error=approvalsQuery.error ?? decideMutation.error;

  if(approvalsQuery.isLoading)return <main className="mx-auto max-w-5xl px-5 py-16">Loading approvals…</main>;
  if(!canManage)return <main className="mx-auto max-w-5xl px-5 py-16">Admin access is required.</main>;
  return <main className="min-h-[75vh] bg-[#fbfaf6] px-5 py-12 text-[#173b35] md:px-8"><div className="mx-auto max-w-5xl"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-[#a7773e]">Admin portal</p><h1 className="mt-2 text-3xl font-bold">Final lesson approvals</h1><p className="mt-2 text-[#6b7c73]">Review lessons confirmed by both the student and teacher.</p></div><button onClick={()=>void approvalsQuery.refetch()} className="inline-flex items-center gap-2 rounded-xl border border-[#d8e2d4] bg-white px-4 py-2.5 text-sm font-semibold"><RefreshCw size={16}/> Refresh</button></div>
  {error&&<p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error instanceof Error ? error.message : "Unable to process approval."}</p>}{notice&&<p role="status" className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-800">{notice}</p>}
  <section className="mt-8 space-y-3">{items.map(item=>{const busy=decideMutation.isPending&&decideMutation.variables?.id===item.id;return <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e5e9df] bg-white p-5 shadow-sm"><div><p className="font-bold">{item.studentName??"Student"} <span className="font-normal text-[#7b8981]">with</span> {item.teacherName??"Teacher"}</p><p className="mt-1 text-sm text-[#66786e]">{display(item.startsAt)}</p><p className="mt-1 text-xs text-[#9a794f]">Teacher confirmed · Awaiting admin approval</p></div><div className="flex gap-2"><button disabled={decideMutation.isPending} onClick={()=>{setNotice("");decideMutation.mutate({id:item.id,approve:true});}} className="inline-flex items-center gap-2 rounded-xl bg-[#1c5145] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Check size={16}/>{busy?"Saving…":"Approve"}</button><button disabled={decideMutation.isPending} onClick={()=>{setNotice("");decideMutation.mutate({id:item.id,approve:false});}} className="inline-flex items-center gap-2 rounded-xl border border-[#ead8d4] px-4 py-2.5 text-sm font-semibold text-[#9a554c] disabled:opacity-50"><X size={16}/> Reject</button></div></article>;})}{!items.length&&<div className="rounded-2xl border border-dashed border-[#d9e3d5] bg-white p-10 text-center text-[#75847b]">There are no lesson requests awaiting final approval.</div>}</section>
  </div></main>;
}
