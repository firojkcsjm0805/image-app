import React, { useState } from "react";
import {
  InfiniteLoader,
  List,
  AutoSizer,
  WindowScroller
} from "react-virtualized";
import "react-virtualized/styles.css";
import "./index.css";
import "./App.css";

const ITEM_HEIGHT = 390;
const ITEM_WIDTH = 240;

function App() {
  const [state, setState] = useState({
    imageList: [],
    currentURL: "",
    viewImage: false,
  });

  let promiseResolver;

  const actuallyLoadMore = () => {
    fetch(`https://picsum.photos/v2/list?page=${(state.imageList.length / 20) + 1 || 1}&limit=20`)
      .then(data => data.json())
      .then(images => {
        setState({
          ...state,
          imageList: state.imageList.concat(images),
        });
      });
    promiseResolver();
  }

  function loadMoreRows({ startIndex, stopIndex }) {
    setTimeout(() => { actuallyLoadMore(startIndex, stopIndex) }, 500)
    return new Promise((resolve, reject) => {
      promiseResolver = resolve;
    })
  }

  const onCancel = () => {
    setState({
      ...state,
      viewImage: false,
      currentURL: ""
    });
  };

  const generateIndexForRow = (rowIndex, maxItemPerRow, itemAmounts) => {
    const result = [];
    const startIndex = rowIndex * maxItemPerRow;
    for (let i = startIndex; i < Math.min(startIndex + maxItemPerRow, itemAmounts); i++) {
      result.push(i);
    }
    return result;
  };

  const getMaxItemPerRow = width => {
    return Math.max(Math.floor(width / ITEM_WIDTH), 1);
  };

  const onClickImage = url => {
    setState({
      ...state,
      viewImage: true,
      currentURL: url
    });
  };

  return (
    <div>
      <div style={{ padding: "20px" }}>
        <AutoSizer disableHeight>
          {({ width }) => (
            <InfiniteLoader
              isRowLoaded={({ index }) => {
                const item = getMaxItemPerRow(width)
                const imgIds = generateIndexForRow(
                  index,
                  item,
                  state.imageList.length
                );
                return !!imgIds.length
              }}
              loadMoreRows={loadMoreRows}
              rowCount={10000}
            >
              {({ onRowsRendered, registerChild }) => (
                <WindowScroller>
                  {({ height, registerChild, scrollTop }) => (
                    <div ref={registerChild}>
                      <List
                        autoHeight
                        height={height}
                        onRowsRendered={onRowsRendered}
                        rowCount={10000}
                        rowHeight={ITEM_HEIGHT}
                        scrollTop={scrollTop}
                        width={width}
                        rowRenderer={({ index, style, key }) => {
                          const maxItemPerRow = getMaxItemPerRow(width);
                          const imgIds = generateIndexForRow(
                            index,
                            maxItemPerRow,
                            state.imageList.length
                          );
                          const st = {
                            ...style,
                            display: "flex"
                          }
                          return (
                            imgIds.length ? <div style={st} key={key}>
                              {imgIds.map(id => (
                                <ImageItem key={id} id={id} data={state.imageList} onClickImage={onClickImage} />))}
                            </div> : null
                          );
                        }}
                      />
                    </div>
                  )}
                </WindowScroller>
              )}
            </InfiniteLoader>
          )}
        </AutoSizer>
      </div>
      {state.viewImage && <ImageView url={state.currentURL} onCancel={onCancel} />}
    </div>
  );
}


const ImageItem = React.memo(function ImageItem(props) {
  const { data, id } = props;
  return (
    <div style={{ width: ITEM_WIDTH, margin: "20px", display: "flex", flexDirection: "column" }} className="cont" key={id}>
      <img onClick={() => props.onClickImage(data[id].download_url)} src={data[id].download_url} style={{ width: "240px", height: "300px", cursor: "pointer" }} alt="img" />
      <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#ded9d9", maxHeight: "60px" }}>Author: <span style={{ fontWeight: "600" }}>{data[id].author}</span></div>
    </div>
  );
});

const ImageView = (props) => {
  return (
    <div className="img-cont">
      <span onClick={() => { props.onCancel() }}>&#10005;</span>
      <a style={{color: "#fff"}} href={props.url} download target="_blank">Download</a>
      <img src={props.url} alt="full-img" className="img-view" />
    </div>
  )
}

export default App;
