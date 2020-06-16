import * as BigInt from 'big-integer';

export const getRandomPrime = (bits: number): BigInt.BigInteger => {
  const min = BigInt.one.shiftLeft(bits - 1);
  const max = BigInt.one.shiftLeft(bits).prev();

  while (true) {
    let p = BigInt.randBetween(min, max);
    if (p.isProbablePrime(256)) {
      return p;
    }
  }
};

export const generateKeys = (size: number): { public_key: string, private_key: string } => {
  const e = BigInt(65537);
  let p: BigInt.BigInteger;
  let q: BigInt.BigInteger;
  let totient: BigInt.BigInteger;

  do {
    p = getRandomPrime(~~(size / 2));
    q = getRandomPrime(~~(size / 2));
    totient = BigInt.lcm(p.prev(), q.prev());
  } while (BigInt.gcd(e, totient).notEquals(1) || p.minus(q).abs().shiftRight(~~(size / 2) - 100).isZero());

  return {
    public_key: p.multiply(q).toString(),
    private_key: e.modInv(totient).toString(),
  };
};

export const encryptMessage = (message: string, public_key: string): string => {
  return BigInt(
    BigInt(
      message.split('').map(i => i.charCodeAt(0)).join(''),
    ),
  ).modPow(BigInt(65537), BigInt(public_key)).toString();
};

export const shuffle = (array: any): any => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = ~~(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  
  return array
}

export const generateCode = (limit: number = 6): string => {
  let letters = 'ABCDEFGHIJKMNPQRSTUVWXYZ',
      lettersArray = letters.split(''),
      lettersShuffle = shuffle(lettersArray),
      numbers = '0123456789',
      numbersArray = numbers.split(''),
      numbersShuffle = shuffle(numbersArray),
      allArray = lettersShuffle.concat(numbersShuffle),
      result = ''

  for (let i = 1; i <= limit; i++) {
    result += allArray[~~(Math.random() * (allArray.length - 0)) + 0]
  }

  return result
}
