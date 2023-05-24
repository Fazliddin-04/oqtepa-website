import BranchesComponent from 'components/UI/Branches/Branches'
import SEO from 'components/SEO'

export default function Branches({ branches = [{ name: 'Your branch', phone: '+998901234567', location: { lat: 0, long: 0 }, address: 'Your address', work_hour_start: '10:00',work_hour_end: '20:00' }] }) {
  return (
    <>
      <SEO />
      <BranchesComponent branches={branches} />
    </>
  )
}
