"use client";

import { useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { getIncomingLessonRequests, respondToLessonRequest } from "@/services/scheduling.service";

const display=(value:string)=>new Date(value).toLocaleString(undefined,{weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});
export default function TeacherLessonRequestsPage(){
  const {role}=useAuth(); const queryClient=useQueryClient();
  const [notice,setNotice]=useState("");
  const requestsQuery=useQuery({
    queryKey:["lesson-requests","teacher"],
    queryFn:getIncomingLessonRequests,
    enabled:role==="teacher",
  });
  const respondMutation=useMutation({
    mutationFn:({id,decision}:{id:string;decision:"confirm"|"reject"})=>respondToLessonRequest(id,decision),
    onSuccess: async (_,{decision})=>{
      setNotice(decision==="confirm"?"Request confirmed and sent to admin for final approval.":"Request rejected; the slot can be requested again.");
      await queryClient.invalidateQueries({queryKey:["lesson-requests"]});
      await queryClient.invalidateQueries({queryKey:["availability"]});
    },
  });
  const items=requestsQuery.data ?? [];
  const error=requestsQuery.error ?? respondMutation.error;

  if(requestsQuery.isLoading)return <main className="mx-auto max-w-5xl px-5 py-16">Loading lesson requests…</main>;
  if(role!=="teacher")return <main className="mx-auto max-w-5xl px-5 py-16">Please sign in with a teacher account.</main>;
  return <main className="min-h-[75vh] bg-[#fbfaf6] px-5 py-12 text-[#173b35] md:px-8"><div className="mx-auto max-w-5xl"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-[#a7773e]">Teacher portal</p><h1 className="mt-2 text-3xl font-bold">Lesson requests</h1><p className="mt-2 text-[#6b7c73]">Confirm or reject the time requested by your student.</p></div><button onClick={()=>void requestsQuery.refetch()} className="inline-flex items-center gap-2 rounded-xl border border-[#d8e2d4] bg-white px-4 py-2.5 text-sm font-semibold"><RefreshCw size={16}/> Refresh</button></div>
  {error&&<p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error instanceof Error ? error.message : "Unable to update request."}</p>}{notice&&<p role="status" className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-800">{notice}</p>}
  <section className="mt-8 space-y-3">{items.filter(x=>x.status==="pending_teacher").map(item=>{const busy=respondMutation.isPending&&respondMutation.variables?.id===item.id;return <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e5e9df] bg-white p-5 shadow-sm"><div><p className="font-bold">{item.studentName??"Student"}</p><p className="mt-1 text-sm text-[#66786e]">Requested lesson · {display(item.startsAt)}</p><p className="mt-1 text-xs capitalize text-[#9a794f]">{item.status.replaceAll("_"," ")}</p></div><div className="flex gap-2"><button disabled={respondMutation.isPending} onClick={()=>{setNotice("");respondMutation.mutate({id:item.id,decision:"confirm"});}} className="inline-flex items-center gap-2 rounded-xl bg-[#1c5145] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Check size={16}/>{busy?"Saving…":"Confirm"}</button><button disabled={respondMutation.isPending} onClick={()=>{setNotice("");respondMutation.mutate({id:item.id,decision:"reject"});}} className="inline-flex items-center gap-2 rounded-xl border border-[#ead8d4] px-4 py-2.5 text-sm font-semibold text-[#9a554c] disabled:opacity-50"><X size={16}/> Reject</button></div></article>;})}{!items.some(x=>x.status==="pending_teacher")&&<div className="rounded-2xl border border-dashed border-[#d9e3d5] bg-white p-10 text-center text-[#75847b]">No lesson requests are waiting for your response.</div>}</section>
  </div></main>;
}
