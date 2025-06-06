// sequelize 참조

interface OpTypes {
    /**
     * Operator -|- (PG range is adjacent to operator)
     *
     * ```js
     * [Op.adjacent]: [1, 2]
     * ```
     * In SQL
     * ```sql
     * -|- [1, 2)
     * ```
     */
    readonly adjacent: unique symbol
    /**
     * Operator ALL
     *
     * ```js
     * [Op.gt]: {
     *  [Op.all]: literal('SELECT 1')
     * }
     * ```
     * In SQL
     * ```sql
     * > ALL (SELECT 1)
     * ```
     */
    readonly all: unique symbol
    /**
     * Operator AND
     *
     * ```js
     * [Op.and]: {a: 5}
     * ```
     * In SQL
     * ```sql
     * AND (a = 5)
     * ```
     */
    readonly and: unique symbol
    /**
     * Operator ANY ARRAY (PG only)
     *
     * ```js
     * [Op.any]: [2,3]
     * ```
     * In SQL
     * ```sql
     * ANY ARRAY[2, 3]::INTEGER
     * ```
     *
     * Operator LIKE ANY ARRAY (also works for iLike and notLike)
     *
     * ```js
     * [Op.like]: { [Op.any]: ['cat', 'hat']}
     * ```
     * In SQL
     * ```sql
     * LIKE ANY ARRAY['cat', 'hat']
     * ```
     */
    readonly any: unique symbol
    /**
     * Operator BETWEEN
     *
     * ```js
     * [Op.between]: [6, 10]
     * ```
     * In SQL
     * ```sql
     * BETWEEN 6 AND 10
     * ```
     */
    readonly between: unique symbol
    /**
     * With dialect specific column identifiers (PG in this example)
     *
     * ```js
     * [Op.col]: 'user.organization_id'
     * ```
     * In SQL
     * ```sql
     * = "user"."organization_id"
     * ```
     */
    readonly col: unique symbol
    /**
     * Operator <@ (PG array contained by operator)
     *
     * ```js
     * [Op.contained]: [1, 2]
     * ```
     * In SQL
     * ```sql
     * <@ [1, 2)
     * ```
     */
    readonly contained: unique symbol
    /**
     * Operator @> (PG array contains operator)
     *
     * ```js
     * [Op.contains]: [1, 2]
     * ```
     * In SQL
     * ```sql
     * @> [1, 2)
     * ```
     */
    readonly contains: unique symbol
    /**
     * Operator LIKE
     *
     * ```js
     * [Op.endsWith]: 'hat'
     * ```
     * In SQL
     * ```sql
     * LIKE '%hat'
     * ```
     */
    readonly endsWith: unique symbol
    /**
     * Operator =
     *
     * ```js
     * [Op.eq]: 3
     * ```
     * In SQL
     * ```sql
     * = 3
     * ```
     */
    readonly eq: unique symbol
    /**
     * Operator >
     *
     * ```js
     * [Op.gt]: 6
     * ```
     * In SQL
     * ```sql
     * > 6
     * ```
     */
    readonly gt: unique symbol
    /**
     * Operator >=
     *
     * ```js
     * [Op.gte]: 6
     * ```
     * In SQL
     * ```sql
     * >= 6
     * ```
     */
    readonly gte: unique symbol
    /**
     * Operator ILIKE (case insensitive) (PG only)
     *
     * ```js
     * [Op.iLike]: '%hat'
     * ```
     * In SQL
     * ```sql
     * ILIKE '%hat'
     * ```
     */
    readonly iLike: unique symbol
    /**
     * Operator IN
     *
     * ```js
     * [Op.in]: [1, 2]
     * ```
     * In SQL
     * ```sql
     * IN [1, 2]
     * ```
     */
    readonly in: unique symbol
    /**
     * Operator ~* (PG only)
     *
     * ```js
     * [Op.iRegexp]: '^[h|a|t]'
     * ```
     * In SQL
     * ```sql
     * ~* '^[h|a|t]'
     * ```
     */
    readonly iRegexp: unique symbol
    /**
     * Operator IS
     *
     * ```js
     * [Op.is]: null
     * ```
     * In SQL
     * ```sql
     * IS null
     * ```
     */
    readonly is: unique symbol
    /**
     * Operator LIKE
     *
     * ```js
     * [Op.like]: '%hat'
     * ```
     * In SQL
     * ```sql
     * LIKE '%hat'
     * ```
     */
    readonly like: unique symbol
    /**
     * Operator <
     *
     * ```js
     * [Op.lt]: 10
     * ```
     * In SQL
     * ```sql
     * < 10
     * ```
     */
    readonly lt: unique symbol
    /**
     * Operator <=
     *
     * ```js
     * [Op.lte]: 10
     * ```
     * In SQL
     * ```sql
     * <= 10
     * ```
     */
    readonly lte: unique symbol
    /**
     * Operator @@
     *
     * ```js
     * [Op.match]: Sequelize.fn('to_tsquery', 'fat & rat')`
     * ```
     * In SQL
     * ```sql
     * @@ to_tsquery('fat & rat')
     * ```
     */
    readonly match: unique symbol
    /**
     * Operator !=
     *
     * ```js
     * [Op.ne]: 20
     * ```
     * In SQL
     * ```sql
     * != 20
     * ```
     */
    readonly ne: unique symbol
    /**
     * Operator &> (PG range does not extend to the left of operator)
     *
     * ```js
     * [Op.noExtendLeft]: [1, 2]
     * ```
     * In SQL
     * ```sql
     * &> [1, 2)
     * ```
     */
    readonly noExtendLeft: unique symbol
    /**
     * Operator &< (PG range does not extend to the right of operator)
     *
     * ```js
     * [Op.noExtendRight]: [1, 2]
     * ```
     * In SQL
     * ```sql
     * &< [1, 2)
     * ```
     */
    readonly noExtendRight: unique symbol
    /**
     * Operator NOT
     *
     * ```js
     * [Op.not]: true
     * ```
     * In SQL
     * ```sql
     * IS NOT TRUE
     * ```
     */
    readonly not: unique symbol
    /**
     * Operator NOT BETWEEN
     *
     * ```js
     * [Op.notBetween]: [11, 15]
     * ```
     * In SQL
     * ```sql
     * NOT BETWEEN 11 AND 15
     * ```
     */
    readonly notBetween: unique symbol
    /**
     * Operator NOT ILIKE (case insensitive) (PG only)
     *
     * ```js
     * [Op.notILike]: '%hat'
     * ```
     * In SQL
     * ```sql
     * NOT ILIKE '%hat'
     * ```
     */
    readonly notILike: unique symbol
    /**
     * Operator NOT IN
     *
     * ```js
     * [Op.notIn]: [1, 2]
     * ```
     * In SQL
     * ```sql
     * NOT IN [1, 2]
     * ```
     */
    readonly notIn: unique symbol
    /**
     * Operator !~* (PG only)
     *
     * ```js
     * [Op.notIRegexp]: '^[h|a|t]'
     * ```
     * In SQL
     * ```sql
     * !~* '^[h|a|t]'
     * ```
     */
    readonly notIRegexp: unique symbol
    /**
     * Operator NOT LIKE
     *
     * ```js
     * [Op.notLike]: '%hat'
     * ```
     * In SQL
     * ```sql
     * NOT LIKE '%hat'
     * ```
     */
    readonly notLike: unique symbol
    /**
     * Operator NOT REGEXP (MySQL/PG only)
     *
     * ```js
     * [Op.notRegexp]: '^[h|a|t]'
     * ```
     * In SQL
     * ```sql
     * NOT REGEXP/!~ '^[h|a|t]'
     * ```
     */
    readonly notRegexp: unique symbol
    /**
     * Operator OR
     *
     * ```js
     * [Op.or]: [{a: 5}, {a: 6}]
     * ```
     * In SQL
     * ```sql
     * (a = 5 OR a = 6)
     * ```
     */
    readonly or: unique symbol
    /**
     * Operator && (PG array overlap operator)
     *
     * ```js
     * [Op.overlap]: [1, 2]
     * ```
     * In SQL
     * ```sql
     * && [1, 2)
     * ```
     */
    readonly overlap: unique symbol
    /**
     * Internal placeholder
     *
     * ```js
     * [Op.placeholder]: true
     * ```
     */
    readonly placeholder: unique symbol
    /**
     * Operator REGEXP (MySQL/PG only)
     *
     * ```js
     * [Op.regexp]: '^[h|a|t]'
     * ```
     * In SQL
     * ```sql
     * REGEXP/~ '^[h|a|t]'
     * ```
     */
    readonly regexp: unique symbol
    /**
     * Operator LIKE
     *
     * ```js
     * [Op.startsWith]: 'hat'
     * ```
     * In SQL
     * ```sql
     * LIKE 'hat%'
     * ```
     */
    readonly startsWith: unique symbol
    /**
     * Operator << (PG range strictly left of operator)
     *
     * ```js
     * [Op.strictLeft]: [1, 2]
     * ```
     * In SQL
     * ```sql
     * << [1, 2)
     * ```
     */
    readonly strictLeft: unique symbol
    /**
     * Operator >> (PG range strictly right of operator)
     *
     * ```js
     * [Op.strictRight]: [1, 2]
     * ```
     * In SQL
     * ```sql
     * >> [1, 2)
     * ```
     */
    readonly strictRight: unique symbol
    /**
     * Operator LIKE
     *
     * ```js
     * [Op.substring]: 'hat'
     * ```
     * In SQL
     * ```sql
     * LIKE '%hat%'
     * ```
     */
    readonly substring: unique symbol
    /**
     * Operator VALUES
     *
     * ```js
     * [Op.values]: [4, 5, 6]
     * ```
     * In SQL
     * ```sql
     * VALUES (4), (5), (6)
     * ```
     */
    readonly values: unique symbol
}

type OpTypesCustom = {
    [k in keyof OpTypes]?: k
}

type WhereInfo<T> = {
    whereOptions: {
        [k in keyof T]?: {
            [ot in keyof OpTypes]?: T[k] | T[k][]
        }
    }
} & {
    offset?: number
    limit?: number
    sortBy?: (keyof T | 'DESC')[][]
}

type PartialK<T, K extends PropertyKey = PropertyKey> = Partial<Pick<T, Extract<keyof T, K>>> & Omit<T, K> extends infer O ? { [P in keyof O]: O[P] } : never
type RequiredK<T extends object, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>

type Mutable<T> = {
    -readonly [key in keyof T]: T[key]
}

type Override<T, K> = Omit<T, keyof K> & K

/**
 * 해당 객체의 key의 값이 PropertyKey인 Unit Type을 추출
 *
 * Mapped Type + Indexed Access Type
 * 1. Mapped Type과 조건부 타입을 활용해 K를 선별하는 과정, 조건에 맞는 KEY값을 선별하여 객체타입을 추출
 * 2. 해당 객체 타입을 [keyof T]로 접근하여 key 목록을 union type으로 추출
 * * indexed Access Type 예제
 * * * type MyType = { name: string; age: number }
 * * * type MyTypeName = MyType['name'] 👉 string
 */
type ValuePropKeys<T, Types extends PropertyKeyRecord = PropertyKeyRecord> = {
    [K in keyof T]: T[K] extends Types ? K : never
}[keyof T]

type PropertyKeyRecord = string | number
