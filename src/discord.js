import { supabase } from './supabase.js';

export async function sendDiscordAlert(task, pic) {
  const { data: setting } = await supabase
    .from('settings').select('value').eq('key', 'discordWebhook').maybeSingle();
  if (!setting?.value) return false;

  const validityDate = new Date(task.validityDate);
  const formattedDate = validityDate.toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
  const priorityEmoji = task.priority === 'high' ? '🔴' : task.priority === 'normal' ? '🟡' : '🟢';

  const payload = {
    username: 'PendingMate',
    embeds: [{
      title: '⏰ Validity 마감 임박 알림',
      color: 0xef4444,
      fields: [
        { name: '📌 업무', value: task.title, inline: false },
        { name: '📝 내용', value: task.content?.substring(0, 100) || '-', inline: false },
        { name: '👤 PIC', value: pic?.name || '미지정', inline: true },
        { name: `${priorityEmoji} 우선순위`, value: task.priority === 'high' ? '높음' : task.priority === 'normal' ? '보통' : '낮음', inline: true },
        { name: '⏰ Validity', value: formattedDate, inline: false },
      ],
      footer: { text: 'PendingMate — JP 업무관리시스템' },
      timestamp: new Date().toISOString(),
    }],
  };

  try {
    await fetch(setting.value, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (e) {
    console.error('Discord 발송 실패:', e);
    return false;
  }
}

export async function checkUpcomingDeadlines() {
  const now = new Date();
  const fiveHoursLater = new Date(now.getTime() + 5 * 60 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const { data: tasks } = await supabase
    .from('tasks').select('*').eq('status', 'ongoing');
  if (!tasks) return;

  const { data: alertedSetting } = await supabase
    .from('settings').select('value').eq('key', 'alertedTasks').maybeSingle();
  const alerted = alertedSetting?.value ? JSON.parse(alertedSetting.value) : {};

  for (const task of tasks) {
    if (!task.validity_date) continue;
    const validity = new Date(task.validity_date);

    if (validity <= fiveHoursLater && validity >= now) {
      const lastAlerted = alerted[task.id];
      if (!lastAlerted || new Date(lastAlerted) < oneHourAgo) {
        let pic = null;
        if (task.pic_id) {
          const { data } = await supabase.from('pics').select('*').eq('id', task.pic_id).single();
          pic = data;
        }
        const mappedTask = {
          id: task.id,
          title: task.title,
          content: task.content,
          validityDate: task.validity_date,
          priority: task.priority,
        };
        const sent = await sendDiscordAlert(mappedTask, pic);
        if (sent) {
          alerted[task.id] = now.toISOString();
          await supabase.from('settings').upsert({ key: 'alertedTasks', value: JSON.stringify(alerted) });
        }
      }
    }
  }
}
