import { useState } from 'react';
import { SearchIcon } from '@chakra-ui/icons';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Image } from '@chakra-ui/image';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/input';
import { Circle, Flex, Link, Text } from '@chakra-ui/layout';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { useDisclosure } from '@chakra-ui/react';
import { Spinner } from '@chakra-ui/spinner';
import { Address } from 'abitype';
import { BigNumber, FixedNumber, ethers } from 'ethers';
import { formatUnits, isAddress } from 'ethers/lib/utils.js';
import Fuse from 'fuse.js';
import { useAccount, useBalance, useNetwork, useToken as useWagmiToken } from 'wagmi';
import WarningModal from '@/components/WarningModal';
import { useToken } from '@/contexts/TokenContext';
import { TokenListContextItem } from '@/contexts/TokenContext';
import useNotifications from '@/hooks/useNotifications';
import { ipfsDomain } from '@/utils/constants';
import { parseIPFSUri } from '@/utils/ipfs';
import { networks } from '@/utils/networks';

type TokenSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (arg0: TokenListContextItem) => void; // eslint-disable-line no-unused-vars
};

type TokenSelectionItemProps = {
  token: TokenListContextItem;
  onClick: (arg0: TokenListContextItem) => void; // eslint-disable-line no-unused-vars
  isBalanceLoading?: boolean;
};

type CustomTokenSelectionItemProps = {
  onSelect: (arg0: TokenListContextItem) => void; // eslint-disable-line no-unused-vars
  key: number;
  tokenAddress: Address;
};

const TokenSelectionItem = ({ token, onClick, isBalanceLoading }: TokenSelectionItemProps) => {
  const tokenBalance = token?.balance || BigNumber.from(0);
  return (
    <Flex
      justify="space-between"
      paddingY=".35rem"
      _hover={{ backgroundColor: 'rgba(184, 192, 220, 0.08)' }}
      borderRadius=".5rem"
      padding=".5rem"
      cursor="pointer"
      onClick={() => onClick(token)}
    >
      <Flex direction="column" justify="center" w="2rem">
        <Image
          boxSize="1.55rem"
          src={
            token.logoURI.slice(0, 4) == 'ipfs'
              ? `${ipfsDomain}${parseIPFSUri(token.logoURI)}`
              : `${token.logoURI}`
          }
          alt={`${token.name}'s token logo`}
          fallback={
            <Circle size="1.55rem" bg="lightgrey">
              <Text fontSize=".5rem">{token.symbol.slice(0, 3)}</Text>
            </Circle>
          }
        />
      </Flex>
      <Flex direction="column" w="100%" paddingLeft="1.5rem">
        <Text fontSize="md">{token.name}</Text>
        <Text fontSize="xs">{token.symbol}</Text>
      </Flex>
      <Flex direction="column" justify="center">
        {isBalanceLoading ? (
          <Spinner />
        ) : (
          <Text size="md">
            {FixedNumber.from(
              formatUnits(tokenBalance.toString() || '0', token?.decimals || 0).toString()
            )
              .round(4)
              .toString() || 0}
          </Text>
        )}
      </Flex>
    </Flex>
  );
};

const EmptyTokenItem = () => {
  return (
    <Flex
      justify="center"
      align="center"
      w="100%"
      paddingY=".35rem"
      _hover={{ backgroundColor: 'rgba(184, 192, 220, 0.08)' }}
      borderRadius=".5rem"
      padding=".5rem"
    >
      <Text fontSize="md">No results</Text>
    </Flex>
  );
};

const CustomTokenSelectionItem = ({
  onSelect,
  key,
  tokenAddress,
}: CustomTokenSelectionItemProps) => {
  const { notifyUser } = useNotifications();
  const { chain } = useNetwork();
  const { isOpen: isCustomOpen, onOpen: onCustomOpen, onClose: onCustomClose } = useDisclosure();
  const {
    isOpen: isBlacklistOpen,
    onOpen: onBlacklistOpen,
    onClose: onBlacklistClose,
  } = useDisclosure();
  const network = networks[chain?.id || 1];
  const tokenLink = `${network.blockExplorerUrl}token/${tokenAddress}`;
  const { data, isError, isLoading } = useWagmiToken({ address: tokenAddress });
  const { address } = useAccount();
  const {
    data: balanceData,
    isError: isBalanceError,
    isLoading: isBalanceLoading,
  } = useBalance({
    address,
    token: tokenAddress,
    chainId: chain?.id,
  });
  const isBlacklisted = network.tokenBlacklist.get(tokenAddress);
  const openModal = isBlacklisted ? onBlacklistOpen : onCustomOpen;

  if (isError) {
    notifyUser({
      alertType: 'warning',
      message: 'Failed to fetch custom token',
    });
  }

  if (isBalanceError) {
    notifyUser({
      alertType: 'error',
      message: 'Failed to fetch custom token balance',
    });
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (data) {
    const token = { ...data, logoURI: '', chainId: chain!.id, balance: balanceData?.value || null };
    return (
      <>
        <TokenSelectionItem
          token={token}
          key={key}
          onClick={openModal}
          isBalanceLoading={isBalanceLoading}
        />
        <WarningModal
          isOpen={isCustomOpen}
          onClose={onCustomClose}
          onClick={() => {
            onSelect(token);
            onCustomClose();
          }}
          address={tokenAddress}
          description={`This token isn't included in the railgun token list. Always conduct your own research before shielding.`}
        >
          <Flex my=".75rem" justify="center">
            <Flex
              alignItems="center"
              gap=".30rem"
              padding=".50rem"
              bg="gray.100"
              borderRadius="1rem"
              _hover={{ backgroundColor: 'rgba(184, 192, 220, 0.15)' }}
            >
              <Link href={tokenLink} _hover={{ textDecoration: 'none' }} isExternal maxW="18rem">
                <Text
                  cursor="pointer"
                  maxW="20rem"
                  textOverflow="ellipsis"
                  overflow="hidden"
                  whiteSpace="nowrap"
                >
                  {tokenLink}
                </Text>
              </Link>
              <Link href={tokenLink} isExternal>
                <ExternalLinkIcon />
              </Link>
            </Flex>
          </Flex>
        </WarningModal>
        <WarningModal
          isOpen={isBlacklistOpen}
          onClose={onBlacklistClose}
          onClick={() => {
            onBlacklistClose();
          }}
          address={tokenAddress}
          description={'This token is blacklisted and cannot be shielded!'}
        />
      </>
    );
  }
  return <EmptyTokenItem />;
};

const TokenSelectionModal = (props: TokenSelectionModalProps) => {
  const { tokenList } = useToken();
  const [searchTerm, setSearchTerm] = useState('');
  const options = {
    includeScore: true,
    keys: ['address', 'name', 'symbol'],
    threshold: 0.2,
  };

  const fuse = new Fuse(tokenList, options);

  const results = fuse.search(searchTerm);
  let allResults = [] as TokenListContextItem[];
  if (searchTerm === '') {
    allResults = tokenList.slice(0, 5);
  } else {
    allResults = results.slice(0, 5).map((item) => item.item);
  }

  return (
    <Modal onClose={props.onClose} isOpen={props.isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Token</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column">
            <InputGroup>
              <InputLeftElement pointerEvents="none" height="100%">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input size="lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </InputGroup>
          </Flex>
          <Flex direction="column" paddingTop="1rem">
            {results.length === 0 && isAddress(searchTerm) ? (
              <CustomTokenSelectionItem
                tokenAddress={ethers.utils.getAddress(searchTerm)}
                key={1}
                onSelect={props.onSelect}
              />
            ) : allResults.length === 0 ? (
              <EmptyTokenItem />
            ) : (
              allResults.map((item, i) => {
                return <TokenSelectionItem token={item} key={i} onClick={props.onSelect} />;
              })
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TokenSelectionModal;