// function Clock() {
//   const [time, setTime] = React.useState(new Date().toLocaleTimeString());

//   React.useEffect(() => {
//     const interval = setInterval(() => {
//       setTime(new Date().toLocaleTimeString());
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div>
//       <h1>Time: {time}</h1>
//     </div>
//   );
// }

// // Render the component
// render(<Clock />);
