import { Maybe, just, nothing } from "../utils/Maybe";

// These example will cover the usage of maybe
// Maybe is a datatype which represent does the value exist or not
// with using it we don't need to write explicit if-s to handle undefined or null
//
// Our first example demonstrates a declarative way to dispatch side effects:
// fromNullable check is our value null or undefined, if it is it turns it to Nothing, otherwise it wrap it will Just
// tapJust will trigger its callback only if a value is there and it will return the exact same value what the input was
// tapNothing will be triggered if the input is Nothing and it will return Nothing.
// 
function example1() {
  const a = null;

  const _ =  
    Maybe.fromNullable(a)
      .tapJust(a => console.log("this will not happen, ever"))
      .tapNothing(() => console.log("But this will"));
}

// Lets introduce `map`. It does the exact same thing as array with one element.
// If the value is Just it will call map on it otherwise it will just pass Nothing.

function example2() {
  const just1 = just(1); // wrap our data
  just1
    .map(a => a + 1) // add 1 to our value; result is 2
    .map(a => a * 10); // input is 2 , multiple the input with 10

  const n = Maybe.fromNullable(undefined); // result is Nothing

  n.map(a => a + 1); // as n is Nothing the map will NOT be called upon it. latter on we will demonstrate how to handle fallbacks (hint there is a fallback method)
}


// a bit more complex example:
// here we can see a way to handle undefined inside existing objects.
// 
function example3() {
  
  type ProfileT = {
    nickName: string | undefined, // don't use nickname? for defining a nullable type as the type system has a bug and it doesn't infer properly
    firstName: string | undefined,
    lastName: string | undefined
  };

  // This is our dummy data:
  // For the sake of this example imagine some server returned this object
  // and the nickname remained undefined, because it is optional
  const profile: ProfileT = {
    nickName: undefined,
    firstName: "Peter",
    lastName: "Jackson"
  };

  const profileM = Maybe.fromNullableObject<ProfileT>(profile);
  // 
  const nickNameToUppercase = 
      profileM.nickName
      .map(d => d.toUpperCase()) // this will happen only if nickname is available
  
  const nickNameWithFallbackToUppercase =
    Maybe.fromNullableObject<ProfileT>(profile)
      .nickName
      .fallback(profileM.firstName) // this method check if there is a value, if not use a fallback value else pass the original value
      .fallback(just("default"))
      .map(d => d.toUpperCase()) // this will always happen as we defined a fallback mechanism

  // maybe you want to do some side effect as well
  nickNameToUppercase
    .tapNothing(() => console.log("nickname is empty!")) // this will occur only if the input is nothing otherwise the chain continues
    .tapJust(nickName => console.log("Nickname is" + nickName)) // this will occur only if the input is just otherwise the chain continues
}


