import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch, Provider } from 'react-redux'
import { TreeSelect } from 'antd'
import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { takeLatest, call, put } from 'redux-saga/effects'
import axios from 'axios'
import { createSlice } from '@reduxjs/toolkit'

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: [],
  reducers: {
    fetchRequest: state => state,
    fetchSuccess: (state, action) => action.payload,
    fetchFailure: state => state,
  },
})

const { fetchRequest, fetchSuccess, fetchFailure } = categoriesSlice.actions


function* fetchCategoriesSaga () {
  try {
    //change the API_ENDPOINT to the right url
    const response = yield call(axios.get, 'API_ENDPOINT')
    yield put(fetchSuccess(response.data))
  } catch (error) {
    yield put(fetchFailure(error))
  }
}

function* watchFetchCategories () {
  yield takeLatest(fetchRequest.type, fetchCategoriesSaga)
}


const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
  reducer: {
    categories: categoriesSlice.reducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(sagaMiddleware),
})

sagaMiddleware.run(watchFetchCategories)

const App = () => {
  const dispatch = useDispatch()
  const categories = useSelector(state => state.categories)
  const [treeData, setTreeData] = useState([])

  useEffect(() => {
    dispatch(fetchRequest())
  }, [dispatch])

  useEffect(() => {
    if (categories.length > 0) {
      const convertedData = convertToTreeData(categories)
      setTreeData(convertedData)
    }
  }, [categories])

  const handleSelect = value => {
    alert(`Selected category ID: ${value}`)
  }


  const convertToTreeData = (categories) => {
    return categories.map(category => {
      const node = {
        title: category.name,
        value: category.categoryId,
        key: category.categoryId,
      }
      if (category.children && category.children.length > 0) {
        node.children = convertToTreeData(category.children)
      }
      return node
    })
  }

  return (
    <div className="App">
      <TreeSelect
        showSearch
        style={{ width: '100%' }}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        placeholder="Please select a category"
        allowClear
        treeDefaultExpandAll
        onChange={handleSelect}
        treeData={treeData}
      />
    </div>
  )
}

export default () => (
  <Provider store={store}>
    <App />
  </Provider>
)
