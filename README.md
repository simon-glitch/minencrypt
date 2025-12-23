
# Install and run
In order to install and run this project:
* Clone the repo.
* Run `npm install` in the terminal while in the repo's folder.
* Run `npm run dev`.
* Click the `localhost:` link. On my machine it is `http://localhost:5173/`. The number might be different on your machine.

These are the standard actions you will need to perform for any project that uses Vite.

# Encrption method
My idea is a simplified version of LWE. This is a symmetric key encryption and decryption method.

So you have a vector `x` that you want to encrpyt. All the values of `x` are integers, `mod k`. `k` is some prime modulus.

To encrypt `x`, we will use a private key, `s`. `s` is simply used for pseudo random number generation (PRNG). We will hash `s` with a salt. The salt will be stored, unencrypted in our final message. The hashed key will be used as the seed for our PRNG.

We will generate a random, invertible matrix `A`, using our PRNG. Since only we know `s`, only we can know `A`. Then we will multiply `A x = y (mod k)`. Doing this `mod k` means `y` looks completely random, and the attacker can't guess `A`, even if they know `x`.

Well, maybe there is some way to find `A` if they know `x`. And most the time the attacker won't even know `x`, since that is the original message which they are trying to find. So we'll um, **up the difficulty!**

We'll take our encrypted vector, `y`, and we'll randomly cycle all of the values in the vector. Then we'll encrypt it again. A few more times. The ranodm cycling means an attacker would have to brute force all possible ways to cycle `y`, which for a long enough message and enough encryption steps, would be more work than brute forcing the secret key. I believe this makes the encrption method maximally secure.

For decrypting our message, we can just uncycle the values in `y`, and then multiply it by `A^-1`. As many times as needed.

In conclusion, we encrypt a vector `x` into a vector `y`, and salt. `y` is the same size as `x`, so this just slightly increases the message length.

This is much simpler and faster than both LWE and RSA. And I believe it is just as secure as LWE. I think the matrix and modulus don't even to be that big, meaning this could easily be run on the CPU of any device. And obviously, setting up a GPU to run this is easy. The only downside, is this a symmetric key. So no ability to "sign" the message `x`, and no public key. Perhaps this system could me modified to do those things? I don't know. I'm not that good at math.




