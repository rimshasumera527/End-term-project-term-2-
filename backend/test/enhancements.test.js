const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { startTest, stopTest, api, login, nextWeekday } = require('./helpers');

let ctx, meera, rahul;

before(async () => {
  ctx = await startTest();
  meera = await login(ctx, 'meera@demo.com');
  rahul = await login(ctx, 'rahul@demo.com');
});

after(async () => stopTest(ctx));

test('tutor blackouts block bookings on that date', async () => {
  const date = nextWeekday(new Date(), 1); // Monday
  const ymd = date.toISOString().slice(0, 10);
  const set = await api(ctx, 'POST', '/tutors/availability/blackouts', { token: meera.token, body: { dates: [ymd] } });
  assert.equal(set.status, 200);
  const r = await api(ctx, 'POST', '/tutors/bookings', { token: rahul.token, body: { tutor: ctx.data.meera._id.toString(), date, start: '17:00', end: '18:00' } });
  assert.equal(r.status, 400);
  assert.ok(r.body.error.message.includes('unavailable'));
  // clear blackout so other tests are unaffected
  await api(ctx, 'POST', '/tutors/availability/blackouts', { token: meera.token, body: { dates: [] } });
});

test('ICS calendar feed returns valid VEVENTs for seeded sessions', async () => {
  const res = await fetch(`${ctx.base}/tutors/calendar.ics`, { headers: { Authorization: `Bearer ${rahul.token}` } });
  assert.equal(res.status, 200);
  assert.ok(res.headers.get('content-type').includes('text/calendar'));
  const ics = await res.text();
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('BEGIN:VEVENT'));
  assert.ok(ics.includes('SUMMARY:TutorSlot: mathematics with Meera Iyer'));
  assert.ok(ics.includes('DTSTART:'));
});

test('my stats compute hours, sessions and spend', async () => {
  const r = await api(ctx, 'GET', '/tutors/stats/me', { token: rahul.token });
  assert.equal(r.status, 200);
  assert.ok(r.body.totalSessions >= 3, `seed has 3+ bookings, got ${r.body.totalSessions}`);
  assert.equal(r.body.completed, 2);
  assert.ok(r.body.hours >= 2);
  assert.ok(r.body.bySubject.mathematics >= 2);
  void meera;
});
