/**
 * Represents a single value requirements
 */

export interface Specification<T = any> {

  /**
   * Defaul value
   */

  default?: T;

  /**
   * True to reject null and undefined
   */

  required?: boolean;

  /**
   * Required "typeof" return value
   */

  type?: string | Function;

  /**
   * Custom validation
   */

  validator?: (value: any) => boolean;

}
