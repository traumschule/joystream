import ContentDirectoryCommandBase from '../../base/ContentDirectoryCommandBase'
import AddClassSchemaSchema from 'cd-schemas/schemas/extrinsics/AddClassSchema.schema.json'
import { AddClassSchema } from 'cd-schemas/types/extrinsics/AddClassSchema'
import { InputParser } from 'cd-schemas'
import { JsonSchemaPrompter, JsonSchemaCustomPrompts } from '../../helpers/JsonSchemaPrompt'
import { JSONSchema } from '@apidevtools/json-schema-ref-parser'
import { IOFlags, getInputJson, saveOutputJson } from '../../helpers/InputOutput'
import { Class } from '@joystream/types/content-directory'

export default class AddClassSchemaCommand extends ContentDirectoryCommandBase {
  static description = 'Add a new schema to a class inside content directory. Requires lead access.'

  static flags = {
    ...IOFlags,
  }

  async run() {
    const account = await this.getRequiredSelectedAccount()
    await this.requireLead()

    const { input, output } = this.parse(AddClassSchemaCommand).flags

    let inputJson = await getInputJson<AddClassSchema>(input)
    if (!inputJson) {
      let selectedClass: Class | undefined
      const customPrompts: JsonSchemaCustomPrompts = [
        [
          'className',
          async () => {
            selectedClass = await this.promptForClass('Select a class to add schema to')
            return selectedClass.name.toString()
          },
        ],
        [
          'existingProperties',
          async () =>
            this.simplePrompt({
              type: 'checkbox',
              message: 'Choose existing properties to keep',
              choices: selectedClass!.properties.map((p, i) => ({ name: `${i}: ${p.name.toString()}`, value: i })),
            }),
        ],
        [/^newProperties\[\d+\]\.property_type\.Single\.Reference/, async () => this.promptForClassReference()],
      ]

      const prompter = new JsonSchemaPrompter<AddClassSchema>(
        AddClassSchemaSchema as JSONSchema,
        undefined,
        customPrompts
      )

      inputJson = await prompter.promptAll()
    }

    this.jsonPrettyPrint(JSON.stringify(inputJson))
    const confirmed = await this.simplePrompt({ type: 'confirm', message: 'Do you confirm the provided input?' })

    if (confirmed) {
      await this.requestAccountDecoding(account)
      const inputParser = new InputParser(this.getOriginalApi())
      this.log('Sending the extrinsic...')
      await this.sendAndFollowTx(account, await inputParser.parseAddClassSchemaExtrinsic(inputJson), true)

      saveOutputJson(output, `${inputJson.className}Schema.json`, inputJson)
    }
  }
}
