import IncentivesCommandBase from '../../base/IncentivesCommandBase'
//import chalk from 'chalk'

export default class GetBountyInfo extends IncentivesCommandBase {
  static description = 'Gets stats'
  static args = [
    {
      name: 'startBlockInput',
      required: true,
    },
    {
      name: 'endBlockInput',
      required: true,
    },
  ]

  static flags = {
    ...IncentivesCommandBase.flags,
  }

  async run(): Promise<void> {
    this.json('args', GetBountyInfo.args)
    let { startBlockInput, endBlockInput } = this.parse(GetBountyInfo).args

    const startBlock = parseInt(startBlockInput)
    const endBlock = parseInt(endBlockInput)
    const bountiesCreatedByHR = await this.getBountiesCreated(startBlock, endBlock)
    this.json('hrBounties', bountiesCreatedByHR)
    this.log(JSON.stringify(bountiesCreatedByHR, null, 4))

    const allBounties = await this.getAllBountyData(startBlock, endBlock)
    this.json('allBounties', allBounties)
    this.log(allBounties)

    const bountyEarners = await this.getBountyEarners(startBlock, endBlock)
    this.json('bountyEarners', bountyEarners)
    this.log(bountyEarners)
    this.json('save', 'bounties')
  }
}
