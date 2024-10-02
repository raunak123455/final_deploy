import React, { useEffect, useState } from "react";
import myImage from "../assets/Maskgroup.png";
import myImage1 from "../assets/Maskgroup1.png";
import myImage2 from "../assets/Maskgroup2.png";
import myImage3 from "../assets/Maskgroup4.png";
import myImage4 from "../assets/Maskgroup5.png";
import "./Home.css";
import Header from "./Header";
import UserStories from "./Stories";
import { useUser } from "./UserContext";
import FilterStories from "./FilterStories";

import axios from "axios";

const Home = ({}) => {
  const { name, loggedIn, MainCategory, setMainCategory, userId, setUserId } =
    useUser();

  // const handleClick = () => {
  //   // Console logging inside handleClick to see the updated state
  //   console.log("Selected Category: ", category);
  // };

  useEffect(() => {
    console.log("usernam33", name);
    const fetchUserIdByName = async () => {
      try {
        const response = await axios.get(
          http://localhost:8080/api/user/by-name/${name}
        );
        setUserId(response.data.userId);
        console.log(response.data);
        console.log("userid", userId);
      } catch (error) {
        console.error("Error fetching userId by name", error);
      }
    };

    fetchUserIdByName();
  }, [loggedIn]);

  return (
    <div>
      <div>
        <Header />
      </div>
      {/* //   <div className="header">
    //     <button className="register">Register Now</button>
    //     <button className="signin">Sign In</button>
    //   </div> */}

      <div className="categories">
        <div className="image-container" onClick={() => setMainCategory("all")}>
          <img src={myImage} />
          <div className="text-overlay">All</div>
        </div>

        <div
          className="image-container"
          onClick={() => setMainCategory("health and fitness")}
        >
          <img src={myImage1} />
          <div className="text-overlay">Health & fitness</div>
        </div>
        <div
          className="image-container"
          onClick={() => setMainCategory("food")}
        >
          <img src={myImage2} />
          <div className="text-overlay">Food</div>
        </div>
        <div
          className="image-container"
          onClick={() => setMainCategory("Education")}
        >
          <img src={myImage4} />
          <div className="text-overlay">Education</div>
        </div>
        <div
          className="image-container"
          onClick={() => setMainCategory("Travel")}
        >
          <img src={myImage3} />
          <div className="text-overlay">Travel</div>
        </div>
      </div>

      {/* <div>
        <h2>Your Stories {name}</h2>
        <UserStories username={name} />}
      </div> */}

      {loggedIn && (
        <div>
          <h2>Your Stories {name}</h2>
          <UserStories username={name} />
        </div>
      )}

      <div></div>
      <div>
        {MainCategory == "food" && (
          <div className="categorys">
            <FilterStories MainCategory={MainCategory} />
          </div>
        )}
      </div>

      <div>
        {MainCategory == "health and fitness" && (
          <div className="categorys">
            <FilterStories MainCategory={MainCategory} />
          </div>
        )}
      </div>

      <div>
        {MainCategory == "Education" && (
          <div className="categorys">
            <FilterStories MainCategory={MainCategory} />
          </div>
        )}
      </div>

      <div>
        {MainCategory == "Travel" && (
          <FilterStories MainCategory={MainCategory} />
        )}
      </div>

      {MainCategory === "all" && (
        <div>
          <div className="categorys">
            {/* <h2>Top stories about food</h2> */}
            <FilterStories MainCategory={"food"} />
          </div>
          <div>
            {/* <h2>Top stories about Health & fitness</h2> */}
            <FilterStories MainCategory={"health and fitness"} />
          </div>

          <div>
            {/* <h2>Top stories about Education</h2> */}
            <FilterStories MainCategory={"Education"} />
          </div>
          <div>
            {/* <h2>Top stories about Travel</h2> */}
            <FilterStories MainCategory={"Travel"} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 