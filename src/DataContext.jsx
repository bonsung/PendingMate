import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase.js';

const DataContext = createContext(null);

const mapTask = (t) => ({
  id: t.id,
  title: t.title,
  content: t.content,
  result: t.result,
  picId: t.pic_id,
  status: t.status,
  validityDate: t.validity_date,
  priority: t.priority,
  createdAt: t.created_at,
  updatedAt: t.updated_at,
});

const mapPic = (p) => ({
  id: p.id,
  name: p.name,
  role: p.role,
  email: p.email,
  phone: p.phone,
  memo: p.memo,
  createdAt: p.created_at,
});

export function DataProvider({ children }) {
  const [tasks, setTasks] = useState(null);
  const [pics, setPics] = useState(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    supabase.from('tasks').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setTasks((data || []).map(mapTask)));
    supabase.from('pics').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setPics((data || []).map(mapPic)));
  }, [tick]);

  const addTask = async (data) => {
    const { data: result } = await supabase.from('tasks').insert({
      title: data.title,
      content: data.content || null,
      result: data.result || null,
      pic_id: data.picId || null,
      status: data.status,
      validity_date: data.validityDate || null,
      priority: data.priority,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
    }).select().single();
    refresh();
    return result;
  };

  const updateTask = async (id, data) => {
    await supabase.from('tasks').update({
      title: data.title,
      content: data.content || null,
      result: data.result || null,
      pic_id: data.picId || null,
      status: data.status,
      validity_date: data.validityDate || null,
      priority: data.priority,
      updated_at: data.updatedAt,
    }).eq('id', id);
    refresh();
  };

  const deleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    await supabase.from('attachments').delete().eq('task_id', id);
    refresh();
  };

  const addPic = async (data) => {
    await supabase.from('pics').insert({
      name: data.name,
      role: data.role || null,
      email: data.email || null,
      phone: data.phone || null,
      memo: data.memo || null,
    });
    refresh();
  };

  const updatePic = async (id, data) => {
    await supabase.from('pics').update({
      name: data.name,
      role: data.role || null,
      email: data.email || null,
      phone: data.phone || null,
      memo: data.memo || null,
    }).eq('id', id);
    refresh();
  };

  const deletePic = async (id) => {
    await supabase.from('pics').delete().eq('id', id);
    refresh();
  };

  return (
    <DataContext.Provider value={{
      tasks, pics, refresh,
      addTask, updateTask, deleteTask,
      addPic, updatePic, deletePic,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
