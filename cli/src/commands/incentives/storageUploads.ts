import { flags } from '@oclif/command'
import IncentivesCommandBase from '../../base/IncentivesCommandBase'
//import chalk from 'chalk'

export default class StorageUploads extends IncentivesCommandBase {
  static description = 'Gets storage replication statistics'
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
    startBlockTimestamp: flags.integer({
      char: 's',
      required: false,
      description: 'The blockheight at the start of the interval you are measuring',
    }),
    endBlockTimestamp: flags.integer({
      char: 'e',
      required: false,
      description: 'The blockheight at the end of the interval you are measuring',
    }),
    ...IncentivesCommandBase.flags,
  }
  async run(): Promise<void> {
    this.json('args', StorageUploads.args)
    this.json('flags', StorageUploads.flags)
    let { startBlockInput, endBlockInput } = this.parse(StorageUploads).args

    const startBlock = parseInt(startBlockInput)
    const endBlock = parseInt(endBlockInput)
    const { startBlockTimestamp, endBlockTimestamp } = this.parse(StorageUploads).flags

    let startDateTime = await this.getTimestamps(startBlock)
    let endDateTime = await this.getTimestamps(endBlock)
    if (startBlockTimestamp && endBlockTimestamp) {
      startDateTime = new Date(startBlockTimestamp)
      endDateTime = new Date(endBlockTimestamp)
    }
    this.log('startDateTime', startDateTime, startDateTime.toString(), startDateTime.toDateString())
    this.log('endDateTime', endDateTime, endDateTime.toString(), endDateTime.toDateString())
    this.json('start', { block: startBlock, time: startDateTime })
    this.json('end', { block: endBlock, time: endDateTime })

    const uploadsInRange = await this.getQNApi().failedUploadsBetweenTimestamps(
      `"${startDateTime}"`,
      `"${endDateTime}"`
    )
    this.json('uploads', uploadsInRange)
    this.log(JSON.stringify(uploadsInRange, null, 4))
    const total_uploads = uploadsInRange.length
    let successful_uploads = 0
    let failed_uploads = 0
    for (let upload of uploadsInRange) {
      if (upload.isAccepted.toString() == 'true') {
        successful_uploads += 1
      } else {
        failed_uploads += 1
      }
    }
    const UPLOAD_SCORE = (successful_uploads / total_uploads - 0.85) / 0.15

    this.log(`total_uploads = ${total_uploads}`)
    this.log(`successful_uploads = ${successful_uploads}`)
    this.log(`failed_uploads = ${failed_uploads}`)
    this.log(`Which gives:`)
    this.log(`UPLOAD_SCORE = ${UPLOAD_SCORE}`)
    this.json('save', 'uploads')
  }
}
