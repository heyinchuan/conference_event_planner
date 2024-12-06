import React, { useState } from "react";  // 这是一个react组件
import "./ConferenceEvent.css";
import TotalCost from "./TotalCost";
import { useSelector, useDispatch } from "react-redux";
import { incrementQuantity, decrementQuantity } from "./venueSlice";
import { decrementAvQuantity, incrementAvQuantity } from "./avSlice";
import { toggleMealSelection } from "./mealsSlice";
const ConferenceEvent = () => {
  const [showItems, setShowItems] = useState(false);  // useState 状态管理，用于控制显示详细内容
  // useState 是React的一个Hook,用于在函数式组件中添加状态管理
  // 状态变量 showItems 是这里定义的状态变量，用于保存当前的状态值
  // 状态更新函数 setShowItems 是一个函数，用于更新状态，React 会自动重新渲染组件来反映状态的变化。

  const [numberOfPeople, setNumberOfPeople] = useState(1); // useState 状态管理，用于记录人数

  const venueItems = useSelector((state) => state.venue);  // Redux 状态管理，从Redux中获取数据
  // 是使用React-Redux提供的useSelector Hook来获取Redux Store中的一部分状态。状态改变，组件就会重新渲染
  // Redux Store是一个全局的状态管理工具，用来储存应用中的状态
  // State 是Redux Store 中的数据结构，通常是一个JavaScript对象，是Redux Store中的整个应用的状态。
  // useSelector Hook函数将Redux Store中state.venue的值赋给了venueItems

  const dispatch = useDispatch();  // Redux 状态管理，用于触发Redux的动作
  // useDispatch是一个React-Redux提供的hook，用于在函数组件中访问Redux的dispatch方法
  // dispatch 是一个函数，使用它可以发送Redux Action. 比如dispatch(incrementQuantity(index))
  // 通过dispatch方法触发Reducer, 修改Redux Store中的状态。
  // 新的状态通过useSelector获取到，触发React重新渲染界面

  const avItems = useSelector((state) => state.av);
  const mealsItems = useSelector((state) => state.meals);

  const remainingAuditoriumQuantity =
    3 -
    venueItems.find((item) => item.name === "Auditorium Hall (Capacity:200)")
      .quantity;
  // venueItems 是通过useSelector从Redux Store中提取出来venue的状态
  // .find方法会遍历venueItems数组，找到一个满足条件的元素，然后将这个元素对应的数量返回回来。表示当前被选择的数量。
  // "Auditorium Hall (Capacity:200)" 这个类型的会议室最多有3个，3-当前被选择的数量表示剩余可用数量

  const handleToggleItems = () => {
    console.log("handleToggleItems called");
    setShowItems(!showItems);
  };
  // 这个用来切换显示详细信息的函数

  const handleAddToCart = (index) => {
    if (
      venueItems[index].name === "Auditorium Hall (Capacity:200)" &&
      venueItems[index].quantity >= 3
    ) {
      return;
    }
    dispatch(incrementQuantity(index));
  };

  const handleRemoveFromCart = (index) => {
    if (venueItems[index].quantity > 0) {
      dispatch(decrementQuantity(index));
    }
  };
  const handleIncrementAvQuantity = (index) => {
    dispatch(incrementAvQuantity(index));
  };

  const handleDecrementAvQuantity = (index) => {
    dispatch(decrementAvQuantity(index));
  };

  const handleMealSelection = (index) => {
    const item = mealsItems[index];
    if (item.selected && item.type === 'mealForPeople') {
      // Ensure numberOfPeople is set before toggling selection
      const newNumberOfPeople = item.selected ? numberOfPeople :0;
      dispatch(toggleMealSelection(index, newNumberOfPeople));
    }
    else {
      dispatch(toggleMealSelection(index));
    }
  };

  const getItemsFromTotalCost = () => {
    const items = [];  // 创建一个名为 items 的空数组来存储用户选择的所有项目
    venueItems.forEach((item) => {
      if (item.quantity > 0) {
        items.push({...item, type: "venue"});
      }
    });
    avItems.forEach((item) => {
      if (
        item.quantity > 0 &&
        !items.some((i) => i.name === item.name && i.type === "av")
      ) {
        items.push({...item, type: "av"});
      }
    });
    mealsItems.forEach((item) => {
      if (item.selected) {
        const itemForDisplay = {...item, type: "meals"};
        if (item.numberOfPeople) {
          itemForDisplay.numberOfPeople = numberOfPeople;
        }
        items.push(itemForDisplay);
      }
    });
    return items;
  };

  const items = getItemsFromTotalCost();

  const ItemsDisplay = ({ items }) => {
    console.log(items);
    return (
      <>
        <div className="display_box1">
          {items.length === 0 && <p>No items selected</p>}
          <table className="table_item_data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Unit Cost</th>
                <th>Quantity</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>${item.cost}</td>
                  <td>
                    {item.type === "meals" || item.numberOfPeople
                      ? ` For ${numberOfPeople} people`
                      : item.quantity}
                  </td>
                  <td>
                    {item.type === "meals" || item.numberOfPeople
                      ? `${item.cost * numberOfPeople}`
                      : `${item.cost * item.quantity}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };
  const calculateTotalCost = (section) => {
    let totalCost = 0;
    if (section === "venue") {
      venueItems.forEach((item) => {
        totalCost += item.cost * item.quantity;
      });
    }
    else if (section === "av") {
      avItems.forEach((item) => {
        totalCost += item.cost * item.quantity;
      });
    }
    else if (section === 'meals') {
      mealsItems.forEach((item) => {
        if (item.selected) {
          totalCost += item.cost * numberOfPeople;
        }
      });
    }
    return totalCost;
  };
  const venueTotalCost = calculateTotalCost("venue");
  const avTotalCost = calculateTotalCost("av");
  const mealsTotalCost = calculateTotalCost("meals")
  const totalCosts = {
    venue: venueTotalCost,
    av: avTotalCost,
    meals: mealsTotalCost,
  };

  const navigateToProducts = (idType) => {
    if (idType == "#venue" || idType == "#addons" || idType == "#meals") {
      if (showItems) {
        // Check if showItems is false
        setShowItems(!showItems); // Toggle showItems to true only if it's currently false
      }
    }
  };

  return (
    <>
      <navbar className="navbar_event_conference">
        <div className="company_logo">Conference Expense Planner</div>
        <div className="left_navbar">
          <div className="nav_links">
            <a href="#venue" onClick={() => navigateToProducts("#venue")}>
              Venue
            </a>
            <a href="#addons" onClick={() => navigateToProducts("#addons")}>
              Add-ons
            </a>
            <a href="#meals" onClick={() => navigateToProducts("#meals")}>
              Meals
            </a>
          </div>
          <button
            className="details_button"
            onClick={() => setShowItems(!showItems)}
          >
            Show Details
          </button>
        </div>
      </navbar>
      <div className="main_container">
        {!showItems ? (
          <div className="items-information">
            <div id="venue" className="venue_container container_main">
              <div className="text">
                <h1>Venue Room Selection</h1>
              </div>
              <div className="venue_selection">
                {venueItems.map((item, index) => (
                  <div className="venue_main" key={index}>
                    <div className="img">
                      <img src={item.img} alt={item.name} />
                    </div>
                    <div className="text">{item.name}</div>
                    <div>${item.cost}</div>
                    <div className="button_container">
                      {venueItems[index].name ===
                      "Auditorium Hall (Capacity:200)" ? (
                        <>
                          <button
                            className={
                              venueItems[index].quantity === 0
                                ? "btn-warning btn-disabled"
                                : "btn-minus btn-warning"
                            }
                            onClick={() => handleRemoveFromCart(index)}
                          >
                            &#8211;
                          </button>
                          <span className="selected_count">
                            {venueItems[index].quantity > 0
                              ? ` ${venueItems[index].quantity}`
                              : "0"}
                          </span>
                          <button
                            className={
                              remainingAuditoriumQuantity === 0
                                ? "btn-success btn-disabled"
                                : "btn-success btn-plus"
                            }
                            onClick={() => handleAddToCart(index)}
                          >
                            &#43;
                          </button>
                        </>
                      ) : (
                        <div className="button_container">
                          <button
                            className={
                              venueItems[index].quantity === 0
                                ? " btn-warning btn-disabled"
                                : "btn-warning btn-plus"
                            }
                            onClick={() => handleRemoveFromCart(index)}
                          >
                            &#8211;
                          </button>
                          <span className="selected_count">
                            {venueItems[index].quantity > 0
                              ? ` ${venueItems[index].quantity}`
                              : "0"}
                          </span>
                          <button
                            className={
                              venueItems[index].quantity === 10
                                ? " btn-success btn-disabled"
                                : "btn-success btn-plus"
                            }
                            onClick={() => handleAddToCart(index)}
                          >
                            &#43;
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="total_cost">Total Cost: ${venueTotalCost}</div>
            </div>

            {/*Necessary Add-ons*/}
            <div id="addons" className="venue_container container_main">
              <div className="text">
                <h1> Add-ons Selection</h1>
              </div>
              <div className="addons_selection">
                {avItems.map((item, index) => (
                  <div className="av_data venue_main" key={index}>
                    <div className="img">
                        <img src={item.img} alt={item.name} />
                    </div>
                    <div className="text"> {item.name} </div>
                    <div> ${item.cost} </div>
                    <div className="addons_btn">
                        <button 
                        className={item.quantity === 0 ? "btn-warning btn-disabled" : "btn-minus btn-warning"} 
                        onClick={() => handleDecrementAvQuantity(index)}
                        > 
                        &ndash; 
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button className=" btn-success" onClick={() => handleIncrementAvQuantity(index)}> &#43; </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="total_cost">Total Cost: ${avTotalCost}</div>
            </div>

            {/* Meal Section */}

            <div id="meals" className="venue_container container_main">
              <div className="text">
                <h1>Meals Selection</h1>
              </div>

              <div className="input-container venue_selection">
                <label htmlFor="numberOfPeople"><h3>Number of People:</h3></label>
                <input type="number" className="input_box5" id="numberOfPeople" value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}
                  min="1"
                />
              </div>
              <div className="meal_selection">
                {mealsItems.map((item, index) =>(
                  <div className="meal_item" key={index} style={{padding: 15}}>
                    <div className="inner">
                      <input type="checkbox" id={`meal_${index}`}   // meal_${index} 要用反引号，非单引号
                        checked={item.selected}
                        onChange={() => handleMealSelection(index)}
                      />
                      <label htmlFor={`meal_${index}`}> {item.name} </label>
                    </div>
                    <div className="meal_cost">${item.cost}</div>
                  </div>
                ))}
              </div>
              <div className="total_cost">Total Cost: ${mealsTotalCost}</div>
            </div>
          </div>
        ) : (
          <div className="total_amount_detail">
            <TotalCost
              totalCosts={totalCosts}
              handleClick={handleToggleItems}
              ItemsDisplay={() => <ItemsDisplay items={items} />}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ConferenceEvent;
