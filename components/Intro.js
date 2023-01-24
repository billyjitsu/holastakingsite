import dynamic from "next/dynamic";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import heroImage from "../images/Tlama.jpg";
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import { ethers } from "ethers";
import React, { useState } from "react";
import Contract from "../contract/contract.json";
import ERCContract from "../contract/tokenContract.json";

const Intro = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [nftMinted, setNFTMinted] = useState(false);
  const [amount, setAmount] = useState(1);
  const [depositAmount, setDepositAmount] = useState(1);

  const STAKINGCONTRACT = '0xD4f4f3E51aC9Feb007C08c8aFdBD1B4A0A5d13d8'
  const TOKENCONTRACT = '0xB614826714121F1be486311342da98249F9B93E8'

  const contractConfig = {
    address: STAKINGCONTRACT, 
    abi: Contract.abi,
  };

  const tokenContractConfig = {
    address: TOKENCONTRACT,
    abi: ERCContract.abi,
  };

  const resetMinter = async () => {
    setNFTMinted(false);
  };

  const handleAmountChange = (e) => {
    try{
    //const adjustAmount = ethers.utils.parseEther(e.target.value);
    setAmount(e.target.value);
    if(amount>0){
      setDepositAmount(ethers.utils.parseEther(e.target.value));
      console.log(depositAmount)
    }
    }catch(error){}
    
    console.log(amount);
  };

  //wagmi Mint
  const { config: approveConfig, data } = usePrepareContractWrite({
    ...contractConfig,
    functionName: "deposit",
    // args: [ethers.utils.parseEther("10")],
    args: [depositAmount],
    overrides: {
      value: ethers.utils.parseEther("0"),
      gasLimit: 1500000,
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  //writeAsync - instead of WRiTE
  const {
    data: approveData,
    writeAsync: tokenClaim,
    isLoading,
    isSuccess,
  } = useContractWrite(approveConfig);

  const approveFunction = async () => {
    try {
      let nftTxn = await tokenClaim?.();
      setLoading(true);
      await nftTxn.wait();
      setLoading(false);
      setNFTMinted(true);
    } catch (error) {
      console.log(error);
    }
  };

  //wagmi Mint
  const { config: approveTokenConfig, dataToken } = usePrepareContractWrite({
    ...tokenContractConfig,
    functionName: "approve",
    args: [STAKINGCONTRACT, ethers.utils.parseEther("100000")],
    overrides: {
      gasLimit: 1500000,
    },
    onError(error) {
      console.log("Error", error);
    },
  });

  //writeAsync - instead of WRiTE
  const {
    data: approveTokenData,
    writeAsync: tokenApprove,
    isTokenLoading,
    isTokenSuccess,
  } = useContractWrite(approveTokenConfig);

  const approveTokenFunction = async () => {
    try {
      let nftTxn = await tokenApprove?.();
      setLoading(true);
      await nftTxn.wait();
      setLoading(false);
      setNFTMinted(true);
    } catch (error) {
      console.log(error);
    }
  };



  return (
    <div className="bg-black h-screen w-full ">
      <div className="flex flex-col md:flex-row px-5 justify-center lg:mr-16 h-screen w-full">
        <div className="m-auto  pt-14 md:pt-0 ml-auto mr-auto md:ml-24 md:mr-10">
          <div>{<Image src={heroImage} alt="heroBanner" width={400} />}</div>
        </div>

        <div className="flex flex-col  items-center justify-center -mt-6 md:mt-0 sm:-ml-0 md:-ml-12">
          <div className="text-center md:text-left md:ml-16 space-x-2 space-y-5">
            <h1 className="text-5xl md:text-7xl font-bold text-white ">
              Deposit your Hola Tokens
            </h1>
            <h1 className="text-md md:text-xl text-white">
              Only 1 Way deposit
            </h1>

            <div className="flex flex-col max-w-xs items-center text-center md:items-start ">
              {!isLoading && !loading && !nftMinted && isConnected && (
                <>
                <input
                  type="number"
                  name="tokenID"
                  placeholder="Amount"
                  min="1"
                  max="5"
                  className="w-1/3 mb-2 md:ml-7 text-black shadow-sm rounded-lg text-center pl-2 "
                  // onChange={(e) => handleAmountChange(e.target.value)}
                  onChange={handleAmountChange}
                  value={amount}
                />
              
                <button
                    className="w-1/2 bg-donut hover:bg-red-600 rounded-full px-12 py-2  text-white font-bold  mb-3"
                    onClick={approveTokenFunction}
                  >
                    Approve
                  </button>
                  <button
                    className="w-1/2 bg-donut hover:bg-red-600 rounded-full px-12 py-2  text-white font-bold  md:mb-0"
                    onClick={approveFunction}
                  >
                    Deposit
                  </button>
              
                </>
              )}

              {!isConnected && (
                <>
                  <ConnectButton />
                </>
              )}

              {isLoading && !loading && !nftMinted && isConnected && (
                <button className="w-1/2 bg-donut hover:bg-red-600 rounded-full px-12 py-2  text-white font-bold mb-10 md:mb-0">
                  Loading
                </button>
              )}

              {loading && !nftMinted && isConnected && (
                <h2 className="w-1/2 text-white font-3xl font-bold animate-pulse mb-10 md:mb-0">
                  prepping your tokens...
                </h2>
              )}

              {nftMinted && !loading && (
                <div className="space-y-2 mb-10">
                  <h3 className="text-lg font-semibold text-white ">
                    You have now approved your tokens!
                  </h3>

                  <br></br>
                  <button
                    className="bg-donut hover:bg-red-600 text-white font-bold rounded-full px-12 py-2 sm:w-auto mb-10 md:mb-0"
                    onClick={() => resetMinter()}
                  >
                    Go Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// export default Intro;
export default dynamic(() => Promise.resolve(Intro), { ssr: false });
