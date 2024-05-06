// import Validator from 'validator'
// import type { Ref } from 'vue'

// // 폼을 일괄로 validate 하고싶을떄는
// // 폼속성을 개별등록하고 rule이랑 맵핑하는 기능이 필요
// // 폼속성은 ref로 선언될 것이다.
// // rule은 Validator 함수를 사용해야함. 근데 없는 것도 있지.
// // invalidMEssage는 내가 만들어야 함.
// interface RuleMap {
//   ref: Ref
//   rule: string
//   options: Object
// }
// type validatorFn = Validator
// // typescript 의 장점을 살리기위해 rule과 option 타입이 바인딩되면 좋은데 그럴수가있나?...
// // 그럴려면 options 타입이 rule vlaue에 따라 정해지는 마법이 필요하다.
// // 하지만 runtime 값을 참조가능한가? 타입스크립트가?
// const a = Validator.blacklist.bind(null, 'a')

// type A = keyof typeof Validator.m
// const a: A

// Validator.blacklist()
// export default function useValidator(ruleMap: RuleMap[]) {
//   function validate(options: { withInfo: boolean }) {}
// }

// Validator.blacklist()

// // name,elt,rule, invalidMessagee
// // Validator.
