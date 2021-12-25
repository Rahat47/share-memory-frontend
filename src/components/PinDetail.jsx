import { useState, useEffect } from 'react';
import { MdDownloadForOffline } from 'react-icons/md';
import { Link, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { client, urlFor } from '../services/client';
import { MasonryLayout, Spinner } from '.';
import { pinDetailMorePinQuery, pinDetailQuery } from '../utils/data';
import { useCallback } from 'react';

const PinDetail = ({ user }) => {
    const { pinId } = useParams();
    const [pins, setPins] = useState(null);
    const [pinDetail, setPinDetail] = useState(null);
    const [comment, setComment] = useState('');
    const [addingComment, setAddingComment] = useState(false);

    const fetchPinDetail = useCallback(async () => {
        let query = pinDetailQuery(pinId);

        if (query) {
            client.fetch(query).then(data => {
                setPinDetail(data[0]);

                if (data[0]) {
                    query = pinDetailMorePinQuery(data[0]);

                    client.fetch(query).then(data => {
                        setPins(data);
                    });
                }
            });
        }
    }, [pinId]);

    const addComment = () => {
        if (comment) {
            setAddingComment(true);

            client
                .patch(pinId)
                .setIfMissing({ comments: [] })
                .insert('after', 'comments[-1]', [
                    {
                        comment,
                        _key: uuidv4(),
                        postedBy: {
                            _type: 'postedBy',
                            _ref: user._id,
                        },
                    },
                ])
                .commit()
                .then(() => {
                    fetchPinDetail();
                    setComment('');
                    setAddingComment(false);
                })
                .catch(err => {
                    console.log(err);
                    setAddingComment(false);
                });
        }
    };

    useEffect(() => {
        fetchPinDetail();
    }, [fetchPinDetail]);

    if (!pinDetail) return <Spinner message='Loading pin' />;

    return (
        <>
            <div className='flex xl:flex-row flex-col m-auto bg-white max-w-[1500px] rounded-[32px]'>
                <div className='flex justify-center items-center md:items-start flex-initial'>
                    <img
                        src={pinDetail?.image && urlFor(pinDetail.image)}
                        alt={pinDetail.title}
                        className='rounded-t-3xl rounded-b-lg'
                    />
                </div>
                <div className='w-full p-5 flex-1 xl:min-w-620'>
                    <div className='flex items-center justify-between'>
                        <div className='flex gap-2 items-center'>
                            <a
                                href={`${pinDetail.image.asset.url}?dl=`}
                                download
                                onClick={e => e.stopPropagation()}
                                className='bg-white w-9 h-9 rounded-full flex items-center justify-center text-dark text-xl opacity-75 hover:opacity-100 hover:shadow-md outline-none'
                            >
                                <MdDownloadForOffline className='text-gray-600' />
                            </a>
                        </div>

                        <p className='text-sm bg-slate-500 px-2 text-white shadow-sm font-mono'>
                            {pinDetail.category}
                        </p>

                        {pinDetail.destination && (
                            <a
                                href={pinDetail.destination}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-gray-600 text-sm'
                            >
                                {pinDetail.destination}
                            </a>
                        )}
                    </div>

                    <div>
                        <h1 className='text-4xl font-bold break-words mt-3'>
                            {pinDetail.title}
                        </h1>
                        <p className='text-gray-600 text-sm mt-3'>
                            {pinDetail.about}
                        </p>
                    </div>

                    <Link
                        to={`/user-profile/${pinDetail.postedBy?._id}`}
                        className='flex gap-2 mt-5 items-center bg-white rounded-lg'
                    >
                        <img
                            src={pinDetail.postedBy?.image}
                            alt={pinDetail.postedBy?.username}
                            className='w-8 h-8 rounded-full object-cover'
                        />
                        <p className='font-semibold capitalize text-sm'>
                            {pinDetail.postedBy?.username}
                        </p>
                    </Link>

                    <h2 className='mt-5 text-2xl'>Comments</h2>
                    <div className='max-h-370 overflow-y-auto border-gray-800/70 border p-5 rounded-md'>
                        {pinDetail?.comments?.map((comment, i) => (
                            <div
                                key={i}
                                className='flex gap-2 mt-5 items-center bg-white rounded-lg'
                            >
                                <img
                                    src={comment.postedBy.image}
                                    alt={`comment by ${comment.postedBy.username}`}
                                    className='w-10 h-10 rounded-full cursor-pointer'
                                />
                                <div className='flex flex-col'>
                                    <p className='font-bold'>
                                        {comment.postedBy.username}
                                    </p>
                                    <p className='text-sm inline-block border-l-2 border-gray-400 ml-4 pl-2'>
                                        {comment.comment}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className='flex flex-wrap mt-8 gap-3 items-center'>
                        <Link to={`/user-profile/${pinDetail.postedBy?._id}`}>
                            <img
                                src={pinDetail.postedBy?.image}
                                alt={pinDetail.postedBy?.username}
                                className='w-10 h-10 rounded-full cursor-pointer'
                            />
                        </Link>
                        <input
                            type='text'
                            name='comment'
                            className='flex-1 border-gray-100 outline-none border-2 p-2 rounded-2xl focus:border-gray-300'
                            placeholder='Add a comment...'
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                        <button
                            type='button'
                            className='bg-red-500 text-white rounded-full px-6 py-2 font-semibold text-base outline-none'
                            onClick={addComment}
                        >
                            {addingComment ? 'Posting Comment...' : 'Post'}
                        </button>
                    </div>
                </div>
            </div>

            <h2 className='text-center font-bold text-4xl mt-8 mb-4 underline decoration-red-500 underline-offset-2'>
                More like this
            </h2>
            {pins?.length ? (
                <>
                    <MasonryLayout pins={pins} />
                </>
            ) : (
                <Spinner message='Loading more pins...' />
            )}
        </>
    );
};

export default PinDetail;
