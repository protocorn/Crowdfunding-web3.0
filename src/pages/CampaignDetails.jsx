import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { FaStar, FaWhatsapp, FaTwitter } from "react-icons/fa";

import { useStateContext } from '../context';
import { CountBox, CustomButton, Loader } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';
import { thirdweb } from '../assets';

const CampaignDetails = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { donate, getDonations, contract, address } = useStateContext();
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [donators, setDonators] = useState([]);
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");

    const styles = {
        container: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        },
        stars: {
            display: "flex",
            flexDirection: "row",
        },
    }
    const colors = {
        orange: "#FFBA5A",
        grey: "#a9a9a9"

    };

    const [currentValue, setCurrentValue] = useState(0);
    const [hoverValue, setHoverValue] = useState(undefined);
    const stars = Array(5).fill(0)

    const handleClick = value => {
        setCurrentValue(value)
    }

    const handleMouseOver = newHoverValue => {
        setHoverValue(newHoverValue)
    };

    const handleMouseLeave = () => {
        setHoverValue(undefined)
    }
    const [CurrentURL, setCurrentURL] = useState('');

    useEffect(() => {
        setCurrentURL(window.location.href);
    }, []);


    const shareText = "Check out this amazing website!";



    const handleWhatsAppShare = () => {
        window.open(
            `https://api.whatsapp.com/send?text=${encodeURIComponent(
                shareText
            )}%20${encodeURIComponent(CurrentURL)}`
        );
    };
    const handleTwitterShare = () => {

        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                shareText
            )}&url=${encodeURIComponent(CurrentURL)}`
        );

    };
    const [ratingsCount, setRatingsCount] = useState({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    });
    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(
                `https://crowdfunding-e3ae2-default-rtdb.firebaseio.com/comments/${state.title}.json`
            );
            const res2 = await fetch(
                `https://crowdfunding-e3ae2-default-rtdb.firebaseio.com/ratings/${state.title}.json`
            );
            const data = await res.json();
            const data2 = await res2.json();
            setComments(Object.values(data || {}));
            let newRatingsCount = { ...ratingsCount };
            Object.values(data2).forEach(rating => {
                newRatingsCount[rating.text] = newRatingsCount[rating.text] + 1 || 1;
            });
            setRatingsCount(newRatingsCount);
        };
        fetchData();
    }, [state.title]);

    let totalRatings = Object.values(ratingsCount).reduce((a, b) => a + b, 0);

    let ratingsPercentage = {};

    Object.keys(ratingsCount).forEach(rating => {
        ratingsPercentage[rating] = ((ratingsCount[rating] / totalRatings) * 100).toFixed(0);
    });

    const handleSubmit = async event => {
        event.preventDefault();
        await fetch(
            `https://crowdfunding-e3ae2-default-rtdb.firebaseio.com/comments/${state.title}.json`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: comment,
                    timestamp: Date.now()
                })
            }
        );
        setComment("");
    };

    const handleRating = async event => {
        event.preventDefault();
        await fetch(
            `https://crowdfunding-e3ae2-default-rtdb.firebaseio.com/ratings/${state.title}.json`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: currentValue,
                    timestamp: Date.now()
                })
            }
        );
    };

    const remainingDays = daysLeft(state.deadline);

    const fetchDonators = async () => {
        const data = await getDonations(state.pId);

        setDonators(data);
    }

    useEffect(() => {
        if (contract) fetchDonators();
    }, [contract, address])

    const handleDonate = async () => {
        setIsLoading(true);

        await donate(state.pId, amount);

        navigate('/')
        setIsLoading(false);
    }

    return (
        <div>
            {isLoading && <Loader />}
            <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
                <div className="flex-1 flex-col">
                    <img src={state.image} alt="campaign" className="w-full h-[410px] rounded-xl" />
                    <div className="relative w-full h-[5px] bg-[#3a3a43] mt-2">
                        <div className="absolute h-full bg-[#4acd8d]" style={{ width: `${calculateBarPercentage(state.target, state.amount_collected)}%`, maxWidth: '100%' }}>
                        </div>
                    </div>
                </div>

                <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
                    <CountBox title="Days Left" value={remainingDays} />
                    <CountBox title={`Raised of ${state.target}`} value={state.amount_collected} />
                    <CountBox title="Total Backers" value={donators.length} />
                </div>
            </div>
            <div className="mt-[20px] flex flex-row p-4 bg-[#1c1c24] rounded-[10px] w-[150px] font-semibold text-white font-epilogue text-[18px]">
                        Share

                        <button className='ml-[-50px] mt-[30px]'>
                            <h1><FaTwitter size="3rem" color='#00acee' onClick={handleTwitterShare} aria-hidden="true" onMouseOver="cursor.pointer" /></h1>
                        </button>

                        <button className='ml-[20px] mt-[30px]'>
                            <h1><FaWhatsapp size="3rem" color='	#25D366' onClick={handleWhatsAppShare} aria-hidden="true" onMouseOver="cursor.pointer" /></h1>
                        </button>
                    </div>

            <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
                <div className="flex-[2] flex flex-col gap-[40px]">
                    <div>
                        <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Creator</h4>

                        <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
                            <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                                <img src={thirdweb} alt="user" className="w-[60%] h-[60%] object-contain" />
                            </div>
                            <div>
                                <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">{state.owner}</h4>
                                <p className="mt-[4px] font-epilogue font-normal text-[12px] text-[#808191]">10 Campaigns</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Story</h4>

                        <div className="mt-[20px]">
                            <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">{state.description}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Donators</h4>

                        <div className="mt-[20px] flex flex-col gap-4">
                            {donators.length > 0 ? donators.map((item, index) => (
                                <div key={`${item.donator}-${index}`} className="flex justify-between items-center gap-4">
                                    <p className="font-epilogue font-normal text-[16px] text-[#b2b3bd] leading-[26px] break-ll">{index + 1}. {item.donator}</p>
                                    <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] break-ll">{item.donation}</p>
                                </div>
                            )) : (
                                <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">No donators yet. Be the first one!</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Comments</h4>
                        <ul>
                            {comments.map(c => (
                                <>
                                    <div className="mt-[30px] relative grid grid-cols-1 gap-4 p-4 mb-8 rounded-lg bg-[#28282e] shadow-lg" key={c.timestamp}>
                                        <div className="relative flex gap-4">
                                            <img src="https://icons.iconarchive.com/icons/diversity-avatars/avatars/256/charlie-chaplin-icon.png" className="relative rounded-lg -top-8 -mb-4 bg-[#1c1c24] border h-20 w-20" alt="" loading="lazy" />
                                            <div className="flex flex-col w-full">
                                                <div className="flex flex-row justify-between">
                                                    <p className="relative text-xl text-[#808191] whitespace-nowrap truncate overflow-hidden">ANONYMOUS</p>
                                                    <a className="text-gray-500 text-xl" href="#"><i className="fa-solid fa-trash"></i></a>
                                                </div>
                                                <p className="text-gray-400 text-sm">{Date(c.timestamp)}</p>
                                            </div>
                                        </div>
                                        <p className="-mt-4 text-[#ececec]">{c.text}</p>
                                    </div>
                                </>
                            ))}
                        </ul>
                        <form onSubmit={handleSubmit}>
                            <div className="py-2 px-4 mb-4 mt-[20px] bg-[#1c1c24] rounded-lg rounded-t-lg border border-gray-800 dark:bg-gray-800 dark:border-gray-200">
                                <label htmlFor="comment" className="sr-only">Your comment</label>
                                <textarea value={comment} onChange={event => setComment(event.target.value)} id="comment" rows="6"
                                    className="px-0 w-full bg-[#1c1c24] text-sm text-white border-0 focus:ring-0 focus:outline-none dark:text-white dark:placeholder-gray-800 dark:bg-gray-800"
                                    placeholder="Write a comment..." required></textarea>
                            </div>
                            <button type="submit"
                                className="inline-flex items-center py-2.5 px-4 text-l font-medium text-center text-white bg-[#8c6dfd] rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800">
                                Post Comment
                            </button>
                        </form>
                    </div>
                </div>

                <div className="flex-1">
                    <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Fund</h4>

                    <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
                        <p className="font-epilogue fount-medium text-[20px] leading-[30px] text-center text-[#808191]">
                            Fund the campaign
                        </p>
                        <div className="mt-[30px]">
                            <input
                                type="number"
                                placeholder="ETH 0.1"
                                step="0.01"
                                className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />

                            <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                                <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">Back it because you believe in it.</h4>
                                <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#808191]">Support the project for no reward, just because it speaks to you.</p>
                            </div>

                            <CustomButton
                                btnType="button"
                                title="Fund Campaign"
                                styles="w-full bg-[#8c6dfd]"
                                handleClick={handleDonate}
                            />
                        </div>
                    </div>
                    <h4 className="mt-[20px] font-epilogue font-semibold text-[18px] text-white uppercase">Ratings</h4>
                    <div>
                        {Object.keys(ratingsPercentage).map(rating => (
                            <div key={rating}>
                                <div className="flex items-center mt-4">
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-500">{rating} star</span>
                                    <div className="w-2/4 h-5 mx-4 bg-gray-200 rounded dark:bg-gray-700">
                                        <div className="h-5 bg-yellow-400 rounded" style={{ width: `${ratingsPercentage[rating]}%` }}></div>
                                    </div>
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-500">{ratingsPercentage[rating]}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={styles.stars} className="flex items-center mt-[30px]">
                        {stars.map((_, index) => {
                            return (
                                <FaStar
                                    key={index}
                                    size={24}
                                    onClick={() => handleClick(index + 1)}
                                    onMouseOver={() => handleMouseOver(index + 1)}
                                    onMouseLeave={handleMouseLeave}
                                    color={(hoverValue || currentValue) > index ? colors.orange : colors.grey}
                                    style={{
                                        marginRight: 10,
                                        cursor: "pointer"
                                    }}
                                />
                            )
                        })}
                    </div>
                    <button onClick={handleRating} class="mt-[20px] bg-[#8c6dfd] hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded-lg">
                        Submit Rating
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CampaignDetails