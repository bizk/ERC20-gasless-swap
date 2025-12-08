/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DexService {
    getDex(): string {
        return 'dex!';
    }

    async getQuotation(from: string, chainFrom: string, chainTo: string, amount: string): Promise<any> {
        console.log("Getting quotation for", from, chainFrom, chainTo, amount);
        const url = "https://api.1inch.com/fusion-plus/quoter/v1.1/quote/receive";

        const config = {
            headers: {
            Authorization: `Bearer ${process.env.INCH_TOKEN}`,
            },
            params: {
            srcChain: "1", // Optimism
            dstChain: "10",
            srcTokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            dstTokenAddress: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
            amount: "1000",
            walletAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            enableEstimate: "false",
            fee: "0",
            },
            paramsSerializer: {
            indexes: null,
            },
        };

        try {
            const response = await axios.get(url, config);
            console.log("Quotation response", response.data);
            return response.data;
        } catch (error) {
            console.error(error);
            return {
                error: (error as Error).message,
                status: 500,
            };
        }
    }
}