import { useEffect, useState, type ChangeEvent } from "react";

type Role = "chicken" | "banana";

interface Player {
  name: string;
  role: Role;
}

function App() {
  const [player1, setPlayer1] = useState<Player>({
    name: "Player 1",
    role: "chicken",
  });
  const [player2, setPlayer2] = useState<Player>({
    name: "Player 2",
    role: "banana",
  });
  const [ready, setReady] = useState<boolean>(false);
  const [startAs, setStartAs] = useState<Player>(player1);

  function createInputChangeName(
    player: Player,
    playerSetter: React.Dispatch<React.SetStateAction<Player>>
  ) {
    return function handleInputChangeName(
      event: ChangeEvent<HTMLInputElement>
    ) {
      playerSetter({ ...player, name: event.target.value });
    };
  }

  return (
    <div className="flex flex-col mx-auto">
      <div className="p-3 w-1/2 flex flex-col gap-5 justify-center items-center mx-auto">
        <div className="font-bold text-2xl">Chicken Banana</div>
        <div className="flex justify-between gap-5">
          <div className="flex items-center gap-3">
            &#x1F414;{" "}
            <input value={player1.name} disabled={ready} onChange={createInputChangeName(player1, setPlayer1)} className="border text-xl disabled:border-none border-neutral-300 rounded-full px-3 py-2" type="text" />
          </div>

          <div className="flex items-center gap-3">
            &#x1F34C;{" "}
            <input value={player2.name} disabled={ready} onChange={createInputChangeName(player2, setPlayer2)} className="border text-xl disabled:border-none border-neutral-300 rounded-full px-3 py-2" type="text" />
          </div>
        </div>
        
        { !ready && <button onClick={() => { setReady(true); setStartAs(player1); }} className="rounded-full w-full px-3 py-2 border border-neutral-300 cursor-pointer hover:bg-neutral-100">
          Start as {getEmojiRole("chicken")} Chicken! 
        </button> }

        { !ready && <button onClick={() => { setReady(true); setStartAs(player2); }} className="rounded-full w-full px-3 py-2 border border-neutral-300 cursor-pointer hover:bg-neutral-100">
          Start as {getEmojiRole("banana")} Banana! 
        </button> }
      </div>

      {ready && startAs && <Game onClickPlayAgain={() => setReady(false)} player1={player1} player2={player2} startAs={startAs} />}
    </div>
  );
}

interface GameProps {
  player1: Player;
  player2: Player;
  startAs: Player;
  onClickPlayAgain: () => void;
}

function createFairState(size: number): { isRevealed: boolean, isTransparentRevealed: boolean, value: Role }[] {
  let chickenLeft = size * 0.5;
  let bananaLeft = size * 0.5;

  return [...Array(size)].map(_ => ({ 
      isRevealed: false, 
      isTransparentRevealed: false,
      value: Math.random() > 0.5 ? 
        (chickenLeft-- > 0 ? "chicken" : "banana") : 
        (bananaLeft-- > 0 ? "banana" : "chicken")
    })
  )
}

function getEmojiRole(role: Role) {
  return role === "chicken" ? <>&#x1F414;</>: <>&#x1F34C;</>
}

function Game({ player1, player2, startAs, onClickPlayAgain }: GameProps) {
  const [currentTurn, _] = useState<Player>(startAs);
  const [gridState, setGridState] = useState<{ isRevealed: boolean, isTransparentRevealed: boolean, value: Role }[]>(createFairState(36));
  const [loser, setLoser] = useState<Player | null>(null);

  const [hover, setHover] = useState<Role | null>(null);

  const winner = loser === player1 ? player2 : player1;
  const chickenLeft = gridState.reduce((previous, current) => previous + (!current.isRevealed && current.value === "chicken" ? 1 : 0), 0);
  const bananaLeft = gridState.reduce((previous, current) => previous + (!current.isRevealed && current.value === "banana" ? 1 : 0), 0);

  useEffect(() => {
    if (loser) setGridState(gridState.map(state => ({ ...state, isTransparentRevealed: state.isRevealed ? false : true })));
  }, [ loser, gridState ]);

  const grid = [...Array(36)].map((_, index) => {
    const { isRevealed, isTransparentRevealed, value } = gridState[index];
    
    function handleClick() {
      if (loser) return;
      // setCurrentTurn(currentTurn === player1 ? player2 : player1);
      
      setGridState(gridState.map((gridItem, gridIndex) => {
          if (gridIndex !== index) return gridItem;

          if (currentTurn.role !== gridItem.value) {
            setLoser(currentTurn);
          }

          if ((currentTurn.role === "chicken" && chickenLeft-1 === 0) || (currentTurn.role === "banana" && bananaLeft-1 === 0)) {
            setLoser(currentTurn === player1 ? player2 : player1);
          }

          return { ...gridItem, isRevealed: true };
        })
      )

      
    }

    return (
      <div key={index} onMouseEnter={_ => setHover(value)} onClick={handleClick} className={`border border-neutral-400 cursor-pointer flex-[1_0_15%] flex items-center justify-center text-2xl ${isRevealed ? "" : "hover:bg-neutral-200"} ${isTransparentRevealed ? value === "chicken" ? "bg-blue-100" : "bg-yellow-100" : "opacity-100"}`}>
        { (isRevealed || isTransparentRevealed) ? getEmojiRole(value) : (index+1) }
      </div>
    );
  });

  return (
    <div className="mx-auto">
      <div className={`fixed bottom-0 left-0 w-[5px] h-[5px] ${hover === "chicken" ? "bg-neutral-100" : "bg-neutral-200"}`}></div>
      { loser && (
          <div className="flex items-center justify-center">
            <div className="bg-neutral-200 w-1/2 h-1/2 flex flex-col gap-5 p-5 justify-center items-center rounded-xl text-xl">
              <div>{loser.name} {getEmojiRole(loser.role)} Lost!</div>
              <div>And {winner.name} {getEmojiRole(winner.role)} Won!</div>
              <button className="p-2 rounded-xl bg-red-500 text-white cursor-pointer hover:bg-red-600" onClick={onClickPlayAgain}>Play again</button>
            </div>
          </div>
        )
      }

      <div className="flex flex-col p-2 text-lg">
        <div>{Math.round(chickenLeft/36 * 100)}% {getEmojiRole("chicken")} left!</div>
        <div>{Math.round(bananaLeft/36 * 100)}% {getEmojiRole("banana")} left!</div>
        <div>Turn of {currentTurn.name} {getEmojiRole(currentTurn.role)}</div>
      </div>
      <div className="w-[600px] h-[600px]  flex flex-wrap">{grid}</div>
    </div>
  );
}

export default App;
