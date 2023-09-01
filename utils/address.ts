import { ethers } from 'ethers';

export const shortenAddress = (address: string) => {
  return `${address.slice(0, 7)}...${address.slice(-4)}`;
};

// --- Compliance ---

export async function assertSupportedAddress(address: string) {
  // Check for public key being passed in, and if so derive the corresponding address.
  if (ethers.utils.isHexString(address) && address.length == 132) {
    address = ethers.utils.computeAddress(address);
  }

  // If needed, resolve recipient ID to an address (e.g. if it's an ENS name).
  const provider = new ethers.providers.StaticJsonRpcProvider(
    `https://mainnet.infura.io/v3/${String(process.env.NEXT_PUBLIC_INFURA_API_KEY)}`
  );
  const errMsg = 'Address is invalid or unavailable';

  // Now check the address against the hardcoded list.
  const bannedAddresses = new Set([
    '0x01e2919679362dFBC9ee1644Ba9C6da6D6245BB1',
    '0x03893a7c7463AE47D46bc7f091665f1893656003',
    '0x04DBA1194ee10112fE6C3207C0687DEf0e78baCf',
    '0x05E0b5B40B7b66098C2161A5EE11C5740A3A7C45',
    '0x07687e702b410Fa43f4cB4Af7FA097918ffD2730',
    '0x0836222F2B2B24A3F36f98668Ed8F0B38D1a872f',
    '0x08723392Ed15743cc38513C4925f5e6be5c17243',
    '0x08b2eFdcdB8822EfE5ad0Eae55517cf5DC544251',
    '0x09193888b3f38C82dEdfda55259A82C0E7De875E',
    '0x098B716B8Aaf21512996dC57EB0615e2383E2f96',
    '0x0E3A09dDA6B20aFbB34aC7cD4A6881493f3E7bf7',
    '0x0Ee5067b06776A89CcC7dC8Ee369984AD7Db5e06',
    '0x12D66f87A04A9E220743712cE6d9bB1B5616B8Fc',
    '0x1356c899D8C9467C7f71C195612F8A395aBf2f0a',
    '0x169AD27A470D064DEDE56a2D3ff727986b15D52B',
    '0x178169B423a011fff22B9e3F3abeA13414dDD0F1',
    '0x179f48c78f57a3a78f0608cc9197b8972921d1d2',
    '0x1967d8af5bd86a497fb3dd7899a020e47560daaf',
    '0x19aa5fe80d33a56d56c78e82ea5e50e5d80b4dff',
    '0x1E34A77868E19A6647b1f2F47B51ed72dEDE95DD',
    '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a',
    '0x22aaA7720ddd5388A3c0A3333430953C68f1849b',
    '0x23173fE8b96A4Ad8d2E17fB83EA5dcccdCa1Ae52',
    '0x23773E65ed146A459791799d01336DB287f25334',
    '0x242654336ca2205714071898f67E254EB49ACdCe',
    '0x2573BAc39EBe2901B4389CD468F2872cF7767FAF',
    '0x26903a5a198D571422b2b4EA08b56a37cbD68c89',
    '0x2717c5e28cf931547B621a5dddb772Ab6A35B701',
    '0x2FC93484614a34f26F7970CBB94615bA109BB4bf',
    '0x2f389ce8bd8ff92de3402ffce4691d17fc4f6535',
    '0x2f50508a8a3d323b91336fa3ea6ae50e55f32185',
    '0x308ed4b7b49797e1a98d3818bff6fe5385410370',
    '0x330bdFADE01eE9bF63C209Ee33102DD334618e0a',
    '0x35fB6f6DB4fb05e6A4cE86f2C93691425626d4b1',
    '0x39D908dac893CBCB53Cc86e0ECc369aA4DeF1A29',
    '0x3AD9dB589d201A710Ed237c829c7860Ba86510Fc',
    '0x3Cffd56B47B7b41c56258D9C7731ABaDc360E073',
    '0x3aac1cC67c2ec5Db4eA850957b967Ba153aD6279',
    '0x3cbded43efdaf0fc77b9c55f6fc9988fcc9b757d',
    '0x3e37627dEAA754090fBFbb8bd226c1CE66D255e9',
    '0x3efa30704d2b8bbac821307230376556cf8cc39e',
    '0x407CcEeaA7c95d2FE2250Bf9F2c105aA7AAFB512',
    '0x43fa21d92141BA9db43052492E0DeEE5aa5f0A93',
    '0x4736dCf1b7A3d580672CcE6E7c65cd5cc9cFBa9D',
    '0x47CE0C6eD5B0Ce3d3A51fdb1C52DC66a7c3c2936',
    '0x48549a34ae37b12f6a30566245176994e17c6b4a',
    '0x4f47bc496083c727c5fbe3ce9cdf2b0f6496270c',
    '0x502371699497d08D5339c870851898D6D72521Dd',
    '0x527653eA119F3E6a1F5BD18fbF4714081D7B31ce',
    '0x538Ab61E8A9fc1b2f93b3dd9011d662d89bE6FE6',
    '0x53b6936513e738f44FB50d2b9476730C0Ab3Bfc1',
    '0x5512d943ed1f7c8a43f3435c85f7ab68b30121b0',
    '0x57b2B8c82F065de8Ef5573f9730fC1449B403C9f',
    '0x58E8dCC13BE9780fC42E8723D8EaD4CF46943dF2',
    '0x5A14E72060c11313E38738009254a90968F58f51',
    '0x5a7a51bfb49f190e5a6060a5bc6052ac14a3b59f',
    '0x5cab7692D4E94096462119ab7bF57319726Eed2A',
    '0x5efda50f22d34F262c29268506C5Fa42cB56A1Ce',
    '0x5f48c2a71b2cc96e3f0ccae4e39318ff0dc375b2',
    '0x5f6c97C6AD7bdd0AE7E0Dd4ca33A4ED3fDabD4D7',
    '0x610B717796ad172B316836AC95a2ffad065CeaB4',
    '0x653477c392c16b0765603074f157314Cc4f40c32',
    '0x67d40EE1A85bf4a4Bb7Ffae16De985e8427B6b45',
    '0x6Bf694a291DF3FeC1f7e69701E3ab6c592435Ae7',
    '0x6acdfba02d390b97ac2b2d42a63e85293bcc160e',
    '0x6be0ae71e6c41f2f9d0d1a3b8d0f75e6f6a0b46e',
    '0x6f1ca141a28907f78ebaa64fb83a9088b02a8352',
    '0x722122dF12D4e14e13Ac3b6895a86e84145b6967',
    '0x723B78e67497E85279CB204544566F4dC5d2acA0',
    '0x72a5843cc08275C8171E582972Aa4fDa8C397B2A',
    '0x743494b60097A2230018079c02fe21a7B687EAA5',
    '0x746aebc06d2ae31b71ac51429a19d54e797878e9',
    '0x756C4628E57F7e7f8a459EC2752968360Cf4D1AA',
    '0x76D85B4C0Fc497EeCc38902397aC608000A06607',
    '0x776198CCF446DFa168347089d7338879273172cF',
    '0x77777feddddffc19ff86db637967013e6c6a116c',
    '0x797d7ae72ebddcdea2a346c1834e04d1f8df102b',
    '0x7Db418b5D567A4e0E8c59Ad71BE1FcE48f3E6107',
    '0x7F19720A857F834887FC9A7bC0a0fBe7Fc7f8102',
    '0x7F367cC41522cE07553e823bf3be79A889DEbe1B',
    '0x7FF9cFad3877F21d41Da833E2F775dB0569eE3D9',
    '0x8281Aa6795aDE17C8973e1aedcA380258Bc124F9',
    '0x833481186f16Cece3f1Eeea1a694c42034c3a0dB',
    '0x83E5bC4Ffa856BB84Bb88581f5Dd62A433A25e0D',
    '0x84443CFd09A48AF6eF360C6976C5392aC5023a1F',
    '0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c',
    '0x8589427373D6D84E98730D7795D8f6f8731FDA16',
    '0x88fd245fEdeC4A936e700f9173454D1931B4C307',
    '0x901bb9583b24d97e995513c6778dc6888ab6870e',
    '0x910Cbd523D972eb0a6f4cAe4618aD62622b39DbF',
    '0x931546D9e66836AbF687d2bc64B30407bAc8C568',
    '0x94A1B5CdB22c43faab4AbEb5c74999895464Ddaf',
    '0x94Be88213a387E992Dd87DE56950a9aef34b9448',
    '0x94C92F096437ab9958fC0A37F09348f30389Ae79',
    '0x97b1043abd9e6fc31681635166d430a458d14f9c',
    '0x9AD122c22B14202B4490eDAf288FDb3C7cb3ff5E',
    '0x9f4cda013e354b8fc285bf4b9a60460cee7f7ea9',
    '0xA160cdAB225685dA1d56aa342Ad8841c3b53f291',
    '0xA60C772958a3eD56c1F15dD055bA37AC8e523a0D',
    '0xB20c66C4DE72433F3cE747b58B86830c459CA911',
    '0xBA214C1c1928a32Bffe790263E38B4Af9bFCD659',
    '0xCC84179FFD19A1627E79F8648d09e095252Bc418',
    '0xCEe71753C9820f063b38FDbE4cFDAf1d3D928A80',
    '0xD21be7248e0197Ee08E0c20D4a96DEBdaC3D20Af',
    '0xD4B88Df4D29F5CedD6857912842cff3b20C8Cfa3',
    '0xD5d6f8D9e784d0e26222ad3834500801a68D027D',
    '0xD691F27f38B395864Ea86CfC7253969B409c362d',
    '0xD692Fd2D0b2Fbd2e52CFa5B5b9424bC981C30696',
    '0xD82ed8786D7c69DC7e052F7A542AB047971E73d2',
    '0xDD4c48C0B24039969fC16D1cdF626eaB821d3384',
    '0xDF3A408c53E5078af6e8fb2A85088D46Ee09A61b',
    '0xEFE301d259F525cA1ba74A7977b80D5b060B3ccA',
    '0xF60dD140cFf0706bAE9Cd734Ac3ae76AD9eBC32A',
    '0xF67721A2D8F736E75a49FdD7FAd2e31D8676542a',
    '0xF7B31119c2682c88d88D455dBb9d5932c65Cf1bE',
    '0xFD8610d20aA15b7B2E3Be39B396a1bC3516c7144',
    '0xa0e1c89Ef1a489c9C7dE96311eD5Ce5D32c20E4B',
    '0xa5C2254e4253490C54cef0a4347fddb8f75A4998',
    '0xa7e5d5a720f06526557c513402f2e6b5fa20b008',
    '0xaEaaC358560e11f52454D997AAFF2c5731B6f8a6',
    '0xaf4c0B70B2Ea9FB7487C7CbB37aDa259579fe040',
    '0xaf8d1839c3c67cf571aa74B5c12398d4901147B3',
    '0xb04E030140b30C27bcdfaafFFA98C57d80eDa7B4',
    '0xb1C8094B234DcE6e03f10a5b673c1d8C69739A00',
    '0xb541fc07bC7619fD4062A54d96268525cBC6FfEF',
    '0xb6f5ec1a0a9cd1526536d3f0426c429529471f40',
    '0xbB93e510BbCD0B7beb5A853875f9eC60275CF498',
    '0xc2a3829F459B3Edd87791c74cD45402BA0a20Be3',
    '0xc455f7fd3e0e12afd51fba5c106909934d8a0e4a',
    '0xca0840578f57fe71599d29375e16783424023357',
    '0xd0975b32cea532eadddfc9c60481976e39db3472',
    '0xd47438C816c9E7f2E2888E060936a499Af9582b3',
    '0xd882cfc20f52f2599d84b8e8d58c7fb62cfe344b',
    '0xd8D7DE3349ccaA0Fde6298fe6D7b7d0d34586193',
    '0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b',
    '0xd96f2B1c14Db8458374d9Aca76E26c3D18364307',
    '0xdcbEfFBECcE100cCE9E4b153C4e15cB885643193',
    '0xdf231d99Ff8b6c6CBF4E9B9a945CBAcEF9339178',
    '0xe7aa314c77f4233c18c6cc84384a9247c0cf367b',
    '0xeDC5d01286f99A066559F60a585406f3878a033e',
    '0xed6e0a7e4ac94d976eebfb82ccf777a3c6bad921',
    '0xf4B067dD14e95Bab89Be928c07Cb22E3c94E0DAA',
    '0xffbac21a641dcfe4552920138d90f3638b3c9fba',
  ]);
  if (bannedAddresses.has(address)) throw new Error(errMsg);

  // Next we check against the Chainalysis contract.
  const abi = ['function isSanctioned(address addr) external view returns (bool)'];
  const contract = new ethers.Contract('0x40C57923924B5c5c5455c48D93317139ADDaC8fb', abi, provider);
  if (await contract.isSanctioned(address)) throw new Error(errMsg);
  return true;
}
