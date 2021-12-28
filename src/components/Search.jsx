import { useState, useEffect } from 'react';
import { MasonryLayout, Spinner } from '.';
import { client } from '../services/client';
import { feedQuery, searchQuery } from '../utils/data';

const Search = ({ searchTerm, setSearchTerm }) => {
    const [pins, setPins] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (searchTerm) {
            setLoading(true);
            const query = searchQuery(searchTerm.toLowerCase());

            client.fetch(query).then(data => {
                setPins(data);
                setLoading(false);
            });
        } else {
            client.fetch(feedQuery).then(data => {
                setPins(data);
                setLoading(false);
            });
        }
    }, [searchTerm]);

    return (
        <div>
            {loading && searchTerm && (
                <Spinner message='We are searching for your query.' />
            )}
            {pins && pins.length > 0 && <MasonryLayout pins={pins} />}
            {pins?.length === 0 && searchTerm && !loading && (
                <div className='mt-10 text-center text-xl'>
                    <h1 className='text-gray-500'>
                        No pins found. Try searching for something else.
                    </h1>
                </div>
            )}
        </div>
    );
};

export default Search;
