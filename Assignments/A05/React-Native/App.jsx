import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomePage from "./src/screens/HomePage";
import Registration from "./src/screens/RegistrationPage";
import LoginPage from "./src/screens/LoginPage";
import LandingPage from "./src/screens/LandingPage";


const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LandingPage"
        screenOptions={{ headerTitleAlign: "center" }} // All headers will have centered titles
      >
        <Stack.Screen
          name="LandingPage"
          component={LandingPage}
          options={{ headerShown: false }} // No header for landing page
        />
        <Stack.Screen
          name="HomePage"
          component={HomePage}
          options={{ title: "Home" }}
        />
        <Stack.Screen
          name="RegistrationPage"
          component={Registration}
          options={{ title: "Registration" }}
        />
        <Stack.Screen
          name="LoginPage"
          component={LoginPage}
          options={{ title: "Login" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
