import React from 'react';
import ReactDOM from 'react-dom';
import SearchForm from './SearchForm';
import ResultsRender from './ResultsRender';

ReactDOM.render(
    <div>
        <SearchForm />
        <ResultsRender />
    </div>,
    document.getElementById('app_root')
)