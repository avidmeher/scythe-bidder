/** @jsx jsx */

import React from "react";
import { jsx } from "@emotion/core";
import { Button, Card, Form, notification, Select, Modal } from "antd";
import client from "./client";
import {
  FACTIONS_BASE,
  FACTIONS_IFA,
  FACTIONS_HI,
  FACTIONS_LO,
  MATS_BASE,
  MATS_IFA,
  MATS_HI,
  MATS_LO,
} from "./constants";
import { MAX_PLAYERS_BASE, MAX_PLAYERS_IFA, MIN_PLAYERS } from "./constants";
import { SCYTHE_BIDDER } from "./constants";
import { QuestionCircleFilled } from "@ant-design/icons";

export default function CreateRoom({ onCreate }: { onCreate: () => void }) {
  const [numPlayers, setNumPlayers] = React.useState(2);
  const [isIfaActive, setIsIfaActive] = React.useState<boolean>(true);
  const [activeCombinations, setActiveCombinations] = React.useState<string>(
    "IFA"
  );
  const maxPlayers = isIfaActive ? MAX_PLAYERS_IFA : MAX_PLAYERS_BASE;

  const { Option } = Select;

  const gameSettingLabel = [
    <div>
      Game setting <QuestionCircleFilled onClick={settingInformation} />
    </div>,
  ];

  function settingInformation() {
    Modal.info({
      title: "Game setting details",
      content: (
        <div css={{ marginTop: 24 }}>
          <p>IFA adds Togawa, Albion, Innovative, and Militant.</p>
          <p>Base includes the five default faction and mat options.</p>
          <p>
            Hi-tier setting removes Albion, Togawa, Agricultural, and
            Engineering
          </p>
          <p>Lo-tier removes Rusviet, Crimea, Innovative, and Militant</p>
          <p>
            <i>
              Learn more about tiers{" "}
              <a href="https://belovedpacifist.com/tiers" target="newWindow">
                here
              </a>
            </i>
          </p>
        </div>
      ),
      onOk() {},
    });
  }

  const onClick = React.useCallback(async () => {
    const numPlayersNum = Number(numPlayers);
    let setupData = null;
    if (activeCombinations === "Base") {
      setupData = {
        factions: FACTIONS_BASE,
        mats: MATS_BASE,
      };
    }
    if (activeCombinations === "IFA") {
      setupData = {
        factions: FACTIONS_IFA,
        mats: MATS_IFA,
      };
    }
    if (activeCombinations === "Hi") {
      setupData = {
        factions: FACTIONS_HI,
        mats: MATS_HI,
      };
    }
    if (activeCombinations === "Lo") {
      setupData = {
        factions: FACTIONS_LO,
        mats: MATS_LO,
      };
    }
    // this if check should be unnecessary
    if (
      !numPlayersNum ||
      numPlayersNum < MIN_PLAYERS ||
      (!isIfaActive && numPlayersNum > MAX_PLAYERS_BASE) ||
      (isIfaActive && numPlayersNum > MAX_PLAYERS_IFA)
    ) {
      return;
    }
    try {
      await client.createMatch(SCYTHE_BIDDER, {
        numPlayers: numPlayersNum,
        setupData: setupData,
      });
      onCreate();
    } catch (e) {
      notification.error({ message: String(e) });
    }
  }, [numPlayers, activeCombinations, isIfaActive, onCreate]);

  return (
    <Card
      css={{ marginTop: 24 }}
      title={
        <div css={{ display: "flex", justifyContent: "space-between" }}>
          <div>Create a room</div>
          {/* <Switch css={{ marginLeft: 12 }} /> */}
        </div>
      }
    >
      <div>
        <div css={{ display: "flex" }}>
          <Form
            name="create-room"
            colon={false}
            labelAlign="left"
            labelCol={{ span: 16 }}
            wrapperCol={{ offset: 4, span: 4 }}
          >
            {/* margin is required for tighter spacing */}
            <Form.Item label={gameSettingLabel} css={{ marginBottom: 0 }}>
              <Select
                defaultValue="IFA"
                style={{ width: 90 }}
                onChange={(value) => {
                  setActiveCombinations(value);
                  if (value !== "IFA") {
                    setIsIfaActive(false);
                    if (numPlayers > MAX_PLAYERS_BASE) {
                      setNumPlayers(MAX_PLAYERS_BASE);
                      notification.warning({
                        message: "Warning",
                        description: `This setting allows only 
                                    up to ${MAX_PLAYERS_BASE} players.`,
                      });
                    }
                  }
                  if (value === "IFA") {
                    setIsIfaActive(true);
                  }
                }}
              >
                <Option value="IFA">IFA</Option>
                <Option value="Base">Base</Option>
                <Option value="Hi">Hi-Tier</Option>
                <Option value="Lo">Lo-Tier</Option>
              </Select>
            </Form.Item>

            {/* margin is required for tighter spacing */}
            <Form.Item label="Number of players" css={{ marginBottom: 0 }}>
              <Select<number>
                value={numPlayers}
                onChange={(value) => {
                  setNumPlayers(value);
                }}
                placeholder="# of players"
                style={{ width: 50 }}
              >
                {Array(maxPlayers + 1 - MIN_PLAYERS)
                  .fill(null)
                  .map((_, idx) => (
                    <Select.Option value={MIN_PLAYERS + idx} key={idx}>
                      {MIN_PLAYERS + idx}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
            <br />
            {/* name and wrapperCol required for proper alignment */}
            <Form.Item
              name="Create"
              wrapperCol={{ offset: -4, span: 4 }}
              css={{ marginBottom: 0 }}
            >
              <Button onClick={onClick} type="primary" htmlType="submit">
                Create
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Card>
  );
}
