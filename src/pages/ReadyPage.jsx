import { Icon } from '../components/Icon'

export function ReadyPage({ shopName, onOpenDashboard }) {
  return (
    <div className="ui-enter mx-auto flex min-h-svh w-full max-w-[680px] flex-col justify-center px-5 py-6 text-center sm:min-h-[820px] sm:px-6 md:min-h-[900px]">
      <div className="icon-chip soft-pulse mx-auto mb-6 grid h-[82px] w-[82px] place-items-center rounded-[28px] bg-[#173f2a] text-white shadow-[0_20px_50px_rgba(23,63,42,0.25)]">
        <Icon name="check" />
      </div>
      <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#5b7567]">Shop Created</p>
      <h1 className="mx-auto max-w-[330px] text-[28px] font-extrabold leading-[1.08] text-[#111814]">
        {shopName || 'Your grocery shop'} is ready for dashboard setup.
      </h1>
      <p className="mx-auto mt-3 max-w-[310px] text-[13px] leading-relaxed text-[#647267]">
        Next screen can become the seller dashboard with status, revenue, orders, and stock overview.
      </p>
      <button
        className="tap-lift mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[18px] border-0 bg-[#173f2a] font-extrabold text-[#fbfcf8] shadow-[0_16px_30px_rgba(23,63,42,0.22)] hover:shadow-[0_20px_36px_rgba(23,63,42,0.28)] active:bg-[#08783c]"
        type="button"
        onClick={onOpenDashboard}
      >
        Open dashboard
        <Icon name="arrow" />
      </button>
    </div>
  )
}
