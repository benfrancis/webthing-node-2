/**
 * Security Scheme
 *
 * @typedef {{
 *   '@type'?: string|Array<string>,
 *   description?: string,
 *   descriptions?: Record<string,string>,
 *   proxy?: string,
 *   scheme?: string,
 * }} SecurityScheme
 */

/**
 * Expected Response
 *
 * @typedef {{
 *   contentType: string
 * }} ExpectedResponse
 */

/**
 * Additional Expected Response
 *
 * @typedef {{
 *   success?: boolean,
 *   contentType?: string,
 *   schema?: string
 * }} AdditionalExpectedResponse
 */

/**
 * Data Schema
 *
 * @typedef {{
 *   '@type'?: string|Array<string>,
 *   title?: string,
 *   titles?: Record<string,string>,
 *   description?: string,
 *   descriptions?: Record<string,string>,
 *   const?: any,
 *   default?: any,
 *   unit?: string,
 *   oneOf?: Array<DataSchema>,
 *   enum?: Array<any>,
 *   readOnly?: boolean,
 *   writeOnly?: boolean,
 *   format?: string,
 *   type?: 'object'|'array'|'string'|'number'|'integer'|'boolean'|'null'
 * }} DataSchema
 */

/**
 * Form
 *
 * @typedef {{
 *   href: string,
 *   contentType?: string,
 *   contentCoding?: string,
 *   security?: string|Array<string>,
 *   scopes?: string|Array<string>,
 *   response?: ExpectedResponse,
 *   additionalResponses?: Array<AdditionalExpectedResponse>,
 *   subprotocol?: string,
 *   op?: string|Array<string>
 * }} Form
 */
// TODO: Constrain set of possible values for op

/**
 * @typedef {{
 *   '@type'?: string|Array<string>,
 *   title?: string,
 *   description?: string
 * }} InteractionDescription
 */

/**
 * Property Description
 *
 * @typedef {InteractionDescription & DataSchema & {
 *   forms: Array<Form>,
 *   observeable?: boolean|undefined
 * }} PropertyDescription
 */

/**
 * Partial Property Description
 *
 * Same as PropertyDescription but forms is optional
 *
 * @typedef {InteractionDescription & DataSchema & {
 *   forms?: Array<Form>,
 *   observeable?: boolean|undefined
 * }} PartialPropertyDescription
 */

/**
 * Action Description
 *
 * @typedef { InteractionDescription & {
 *   forms: Array<Form>,
 *   input?: DataSchema,
 *   output?: DataSchema,
 *   safe?: boolean,
 *   idempotent?: boolean,
 *   synchronous?: boolean,
 * }} ActionDescription
 */

/**
 * Partial Action Description
 *
 * Same as ActionDescription but forms is optional
 *
 * @typedef { InteractionDescription & {
 *   forms?: Array<Form>,
 *   input?: DataSchema,
 *   output?: DataSchema,
 *   safe?: boolean,
 *   idempotent?: boolean,
 *   synchronous?: boolean,
 * }} PartialActionDescription
 */

/**
 * Thing Description
 *
 * @typedef {{
 *   '@context': string|Array<string|Record<string, string>>,
 *   '@type'?: string|Array<string>,
 *   id?: string,
 *   title: string,
 *   description?: string,
 *   base?: string,
 *   properties?: Record<string, PropertyDescription>,
 *   actions?: Record<string, ActionDescription>,
 *   security: string|Array<string>,
 *   securityDefinitions: string|Record<string, object>
 * }} ThingDescription
 */

/**
 * Partial Thing Description
 *
 * Like a Thing Description but all members except title are optional and
 * property descriptions may be partial.
 *
 * @typedef {{
 *   '@context'?: string|Array<string|Record<string, string>>,
 *   '@type'?: string|Array<string>,
 *   id?: string,
 *   title: string,
 *   description?: string,
 *   base?: string,
 *   properties?: Record<string, PartialPropertyDescription>,
 *   actions?: Record<string, ActionDescription>,
 *   security?: string|Array<string>,
 *   securityDefinitions?: string|Record<string, object>
 * }} PartialThingDescription
 */
