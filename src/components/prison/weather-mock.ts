export type Hour = { at: string; tempC: number; icon: 'sun'|'cloud'|'rain'|'snow' };

export function getMockWeather(now = new Date()) {
  const base = Math.round(6 + 6 * Math.sin(now.getHours() / 24 * Math.PI)); // ~6..12°C
  const icons: Hour['icon'][] = ['cloud','sun','sun','cloud','rain','cloud','sun'];
  const hours: Hour[] = Array.from({length:7}).map((_,i)=> {
    const d = new Date(now.getTime() + i*60*60*1000);
    return { at: d.toLocaleTimeString('is-IS',{hour:'2-digit'}), tempC: base + (i%3?-1:1), icon: icons[i]||'cloud' };
  });
  return {
    place: 'Reykjavík',
    now: { tempC: hours[0].tempC, icon: hours[0].icon },
    next: hours.slice(1),
  };
}
