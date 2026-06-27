import { requireDashboardSession } from "@/auth/guards"
import { getSiteNavigationSettings } from "@/db/siteSettings"
import { siteNavigationSections } from "@/site/navigation"
import { updateSiteNavigationSettingsAction } from "./actions"

export default async function DashboardSettingsPage() {
  await requireDashboardSession()

  const settings = await getSiteNavigationSettings()

  return (
    <>
      <h2 className="font-black text-2xl">Settings</h2>

      <form
        action={updateSiteNavigationSettingsAction}
        className="flex max-w-xl flex-col gap-4"
      >
        <fieldset className="panel flex flex-col gap-4">
          <legend className="px-2 font-black text-xl">Top navigation</legend>
          {siteNavigationSections.map((section) => (
            <label
              className="flex items-center gap-4 font-mono text-sm"
              htmlFor={section.field}
              key={section.field}
            >
              <input
                className="size-4 accent-accent"
                defaultChecked={settings[section.field]}
                id={section.field}
                name={section.field}
                type="checkbox"
              />
              <span>{section.label}</span>
            </label>
          ))}
        </fieldset>

        <button className="button" type="submit">
          Save settings
        </button>
      </form>
    </>
  )
}
