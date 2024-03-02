import {
  DAPP_ADDRESS,
  APTOS_FAUCET_URL,
  APTOS_NODE_URL,
  MODULE_URL,
  BLOCK_COLLECTION_NAME,
  STATE_SEED,
} from "../config/constants";
import { useWallet } from "@manahippo/aptos-wallet-adapter";
import { MoveResource } from "@martiandao/aptos-web3-bip44.js/dist/generated";
import { useState, useEffect } from "react";
import React from "react";
import {
  AptosAccount,
  WalletClient,
  HexString,
  Provider,
  Network,
} from "@martiandao/aptos-web3-bip44.js";
import { BlockType } from "../types";
import toast, { LoaderIcon } from "react-hot-toast";
import { Block } from "../types/Block";
import { BlockItem } from "../components/BlockItem";

export default function Home() {

  const client = new WalletClient(APTOS_NODE_URL, APTOS_FAUCET_URL);

  const { account, signAndSubmitTransaction } = useWallet();

  const [isLoading, setLoading] = useState<boolean>(false);
  const [blockType, setBlockType] = useState<number>(BlockType.Cell_0);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<number>();
  const [isStackMode, setStackMode] = useState<boolean>(false);

  const loadBlocks = async () => {
    
    if (account && account.address) {
      // try {
        setLoading(true);

        setStackMode(false);
        setSelectedId(undefined);

        const provider = new Provider({
          fullnodeUrl: "https://fullnode.random.aptoslabs.com/v1",
          indexerUrl: "https://indexer-randomnet.hasura.app/v1/graphql"
        });
        const resourceAddress = await AptosAccount.getResourceAccountAddress(
          DAPP_ADDRESS,
          new TextEncoder().encode(STATE_SEED)
        );
        const collectionAddress = await provider.getCollectionAddress(
          resourceAddress,
          BLOCK_COLLECTION_NAME
        );

        const tokens = await provider.getTokenOwnedFromCollectionAddress(
          account.address.toString(),
          collectionAddress,
          {
            tokenStandard: "v2",
          }
        );

        const blocks = tokens.current_token_ownerships_v2.map((t) => {
          const token_data = t.current_token_data;
          const properties = token_data?.token_properties;
          console.log("token_data", token_data);
          console.log("properties", properties);
          return {
            name: token_data?.token_name || "",
            token_id: token_data?.token_data_id || "",
            token_uri: token_data?.token_uri || "",
            id: properties.id,
            type: properties.type,
            count: properties.count,
          };
        });
        console.log(tokens);
        setBlocks(blocks);
      // } catch {}

      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, [account]);

  const handleMintBlock = async () => {
    if (!account) {
      toast.error("You need to connect wallet");
      return;
    }

    const toastId = toast.loading("Minting block...");
    console.log(account);
    // // Mint block by randomlly type
    // public entry fun mint_to(creator: &signer, to: address) acquires State {

    try {
      const payloads = {
        type: "entry_function_payload",
        function: DAPP_ADDRESS + "::test_block::mint",
        type_arguments: [],
        arguments: [],
        // mint to signer as default.
      };

      const tx = await signAndSubmitTransaction(payloads, {
        gas_unit_price: 100,
      });
      console.log(tx);

      toast.success("Minting block successed...", {
        id: toastId,
      });

      setTimeout(() => {
        loadBlocks();
      }, 3000);
    } catch (ex) {
      console.log(ex);
      toast.error("Minting block failed...", {
        id: toastId,
      });
    }
  };

  const handleBurnBlock = async () => {
    if (!account) {
      toast.error("You need to connect wallet");
      return;
    }

    if (!selectedId) {
      toast.error("You need to select burn block");
      return;
    }

    const toastId = toast.loading("Burning block...");

    try {
      const payloads = {
        type: "entry_function_payload",
        function: DAPP_ADDRESS + "::block::burn_block",
        type_arguments: [],
        arguments: [selectedId],
      };

      const tx = await signAndSubmitTransaction(payloads, {
        gas_unit_price: 100,
      });
      console.log(tx);

      toast.success("Burning block successed...", {
        id: toastId,
      });
      setSelectedId(undefined);

      setTimeout(() => {
        loadBlocks();
      }, 3000);
    } catch (ex) {
      console.log(ex);
      toast.error("Burning block failed...", {
        id: toastId,
      });
    }
  };

  const handleStackBlock = async (otherBlock: number) => {
    if (!account) {
      toast.error("You need to connect wallet");
      return;
    }

    if (!selectedId) {
      toast.error("You need to select start block");
      return;
    }

    const toastId = toast.loading("Stacking block...");

    try {
      const payloads = {
        type: "entry_function_payload",
        function: DAPP_ADDRESS + "::test_block::stack_block",
        type_arguments: [],
        arguments: [selectedId, otherBlock],
      };

      const tx = await signAndSubmitTransaction(payloads, {
        gas_unit_price: 100,
      });
      console.log(tx);

      toast.success("Stacking block successed...", {
        id: toastId,
      });
      setSelectedId(undefined);

      setTimeout(() => {
        loadBlocks();
      }, 3000);
    } catch (ex) {
      console.log(ex);
      toast.error("Stacking block failed...", {
        id: toastId,
      });
    }
  };

  const handleSelect = (id: number) => {
    if (isStackMode) {
      if (selectedId != id) {
        handleStackBlock(id);
      }
    } else {
      if (selectedId != id) {
        setSelectedId(id);
      } else {
        setSelectedId(undefined);
      }
    }
  };

  return (
    <div>
      {/* TODO:
     [x] Mint Block with smart contract 
     2/ Stack the block
     3/ Gallery to show the blocks
    */}
      <center>
        <p>
          <b>Module Path: </b>
          <a target="_blank" href={MODULE_URL} className="underline">
            {DAPP_ADDRESS}::test_movecraft
          </a>
        </p>

        {
          <div className="my-4">
            {/* TODO: YI with diff colors */}
            <h4>
              ꂖꈠꅁꀦꄃꇐꅐꅃ <b>ALL CELLS!</b> ꂖꈠꅁꀦꄃꇐꅐꅃ
            </h4>
            <br></br>
            <div className="flex gap-4 items-center justify-center">
              {/* TODO: bold the YI language */}
              {/*const URI: vector<u8> = b"ZSuRY-jNPllbaPAWKLfGUPRv-5_QCP8Rya2sskqfqyc";
              const URI: vector<u8> = b"m2FUu-9_-qFw91eM5ft9N07QyUJzrtiT7lCBhtvU5BA";
              const URI: vector<u8> = b"3z0hO8mspZ7uihEpAVoo7xbOrYIlKYwwtQKFvd0t11s";
              const URI: vector<u8> = b"h5PywMJR0_7TfGYjBcYHTtclpd1kP26XOM1m9VFIUQc";
              const URI: vector<u8> = b"Q4GjxhumU1s621b4F1rCWJkzIEpuMiS4KrRttuL3F-c";
              const URI: vector<u8> = b"5QPqZsLb9CbpHqIojZGNXf6QkLB5FGB4_qjbFGDEn4E";
              const URI: vector<u8> = b"NwWHZeliXk7UIwjUnCCw35vKEhBd8KTbd591jInMhRw";
              const URI: vector<u8> = b"tc9aNgx5OxcFoC9IuCadqnDUHIq1i036u2qgqdW77Pw"; */}

              <img
                style={{ width: "10%" }}
                src="https://arweave.net/ZSuRY-jNPllbaPAWKLfGUPRv-5_QCP8Rya2sskqfqyc"
              ></img>
              <img
                style={{ width: "10%" }}
                src="https://arweave.net/m2FUu-9_-qFw91eM5ft9N07QyUJzrtiT7lCBhtvU5BA"
              ></img>
              <img
                style={{ width: "10%" }}
                src="https://arweave.net/3z0hO8mspZ7uihEpAVoo7xbOrYIlKYwwtQKFvd0t11s"
              ></img>
              <img
                style={{ width: "10%" }}
                src="https://arweave.net/h5PywMJR0_7TfGYjBcYHTtclpd1kP26XOM1m9VFIUQc"
              ></img>
              <img
                style={{ width: "10%" }}
                src="https://arweave.net/Q4GjxhumU1s621b4F1rCWJkzIEpuMiS4KrRttuL3F-c"
              ></img>
              <img
                style={{ width: "10%" }}
                src="https://arweave.net/5QPqZsLb9CbpHqIojZGNXf6QkLB5FGB4_qjbFGDEn4E"
              ></img>
              <img
                style={{ width: "10%" }}
                src="https://arweave.net/NwWHZeliXk7UIwjUnCCw35vKEhBd8KTbd591jInMhRw"
              ></img>
              <img
                style={{ width: "10%" }}
                src="https://arweave.net/tc9aNgx5OxcFoC9IuCadqnDUHIq1i036u2qgqdW77Pw"
              ></img>
            </div>
            <br></br>
            <div className="flex gap-4 items-center justify-center">
              {/* TODO: list block types */}
              <button
                type="button"
                className="bg-blue-500 rounded-md text-white px-4 py-2 hover:bg-blue-600"
                onClick={handleMintBlock}
              >
                Mint Block Randomly!
              </button>

              <button
                type="button"
                className="bg-blue-500 rounded-md text-white px-4 py-2 hover:bg-blue-600"
                onClick={loadBlocks}
              >
                Load Blocks
              </button>

              {selectedId && (
                <>
                  {/* <button
                    type="button"
                    className="bg-red-500 rounded-md text-white px-4 py-2 hover:bg-red-600"
                    onClick={handleBurnBlock}
                  >
                    Burn Block
                  </button> */}
                  <button
                    type="button"
                    className="bg-green-500 rounded-md text-white px-4 py-2 hover:bg-green-600"
                    onClick={() => setStackMode(!isStackMode)}
                  >
                    {isStackMode ? "Cancle Stack" : "Stack Block"}
                  </button>
                </>
              )}
            </div>

            <br></br><br></br>
            <div className="flex gap-4">
              {isLoading ? (
                <LoaderIcon className="!w-8 !h-8" />
              ) : (
                blocks.map((block, idx) => (
                  <BlockItem
                    key={idx}
                    block={block}
                    selectedId={selectedId}
                    isStackMode={isStackMode}
                    handleSelect={handleSelect}
                  />
                ))
              )}
            </div>
          </div>
        }
      </center>
    </div>
  );
}
