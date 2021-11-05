/**
 * Option object to control this package
 */
interface Options {
  /**
   * Bool determine to keep the keys missing from the input but present in the map but only with values of null
   */
  keepKeys?: boolean,
  /**
   * Bool if true will throw an error when an alien attribute is found
   */
  throwErrorOnAlien?: boolean,

  /**
   * If true, will pass null or undefined through
   */
  allowNullish?: boolean

  /**
   * If true, will pass null or undefined keys through
   */
  allowNullishKeys?: boolean

  /**
   * If true, will not attempt to reduce the input when the map is an empty object
   */
  permitEmptyMap?: boolean

  /**
   * If true, will not attempt to reduce the input when the map is undefined
   */
  permitUndefinedMap?: boolean
}

export default function(input: object, map: object, options?: Options): object
